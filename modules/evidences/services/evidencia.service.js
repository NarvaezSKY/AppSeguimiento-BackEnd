import Evidencia from "../../../models/evidence/evidenciaModel.js";
import Actividad from "../../../models/evidence/actividadModel.js";
import mongoose from "mongoose";
import {
  addEvidenciaToSheet,
  updateEvidenciaInSheet,
} from "./sheets.service.js";

// -------------------- Helpers de sincronización Sheets --------------------
const shouldAwaitSheetSync = () => {
  const mode = (process.env.SHEETS_SYNC_MODE || "").toLowerCase();
  if (mode === "await") return true;
  if (mode === "async") return false;
  return process.env.NODE_ENV === "production"; // default: await en prod
};

const getSyncTimeoutMs = () => {
  const raw = process.env.SHEETS_SYNC_TIMEOUT_MS;
  const n = raw ? Number(raw) : NaN;
  if (!Number.isFinite(n) || n <= 0) return 4000; // default 4s
  return n;
};

const runWithTimeout = async (promiseFactory, label, id) => {
  const timeoutMs = getSyncTimeoutMs();
  const t0 = Date.now();
  let finished = false;
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      if (!finished) {
        reject(
          new Error(
            `Timeout ${timeoutMs}ms en sincronización ${label}${
              id ? " " + id : ""
            }`
          )
        );
      }
    }, timeoutMs);
  });
  try {
    const result = await Promise.race([promiseFactory(), timeoutPromise]);
    finished = true;
    console.log(
      `[Sheets] ${label}${id ? " " + id : ""} OK en ${Date.now() - t0}ms`
    );
    return result;
  } catch (err) {
    console.error(
      `[Sheets] ${label}${id ? " " + id : ""} ERROR tras ${Date.now() - t0}ms:`,
      err.message
    );
    throw err;
  }
};

const createEvidencia = async (data) => {
  const {
    actividad,
    tipoEvidencia,
    mes,
    trimestre,
    anio,
    fechaEntrega,
    responsables,
    estado,
  } = data || {};
  if (
    !actividad ||
    !tipoEvidencia ||
    mes == null ||
    trimestre == null ||
    anio == null ||
    !fechaEntrega
  )
    throw new Error("Faltan campos obligatorios");
  if (!mongoose.Types.ObjectId.isValid(actividad))
    throw new Error("ID de actividad inválido");
  const act = await Actividad.findById(actividad).populate("componente");
  if (!act) throw new Error("Actividad no encontrada");
  let entregadoEn = null;
  if (estado === "Entregada" || estado === "Entrega Extemporanea") {
    entregadoEn = Date.now();
  }
  const doc = new Evidencia({
    actividad,
    tipoEvidencia,
    mes,
    trimestre,
    anio,
    fechaEntrega,
    responsables: responsables || [],
    estado: estado || undefined,
    entregadoEn,
  });
  await doc.save();
  await doc.populate({ path: "actividad", populate: { path: "componente" } });
  await doc.populate("responsables");
  const obj = doc.toObject();
  delete obj.__v;

  // Sincronización con Google Sheet (condicional)
  if (shouldAwaitSheetSync()) {
    try {
      await runWithTimeout(
        () => addEvidenciaToSheet(obj),
        "Create evidencia",
        obj._id
      );
    } catch (err) {
      // No interrumpir la respuesta principal
    }
  } else {
    addEvidenciaToSheet(obj)
      .then(() =>
        console.log(`[Sheets] (async) Create evidencia ${obj._id} OK`)
      )
      .catch((err) =>
        console.error(
          `[Sheets] (async) Create evidencia ${obj._id} ERROR:`,
          err.message
        )
      );
  }

  return obj;
};

const getAllEvidencias = async (filter = {}) => {
  const q = {};
  let usePagination = false;
  let page = null;
  let perPage = null;

  if (filter.page != null && (filter.limit != null || filter.perPage != null)) {
    page = Number(filter.page);
    perPage =
      filter.limit != null ? Number(filter.limit) : Number(filter.perPage);
    if (!Number.isInteger(page) || page < 1) throw new Error("Page inválido");
    if (!Number.isInteger(perPage) || perPage < 1)
      throw new Error("Limit inválido");
    usePagination = true;
  }

  if (filter.actividad) {
    if (!mongoose.Types.ObjectId.isValid(filter.actividad))
      throw new Error("ID de actividad inválido");
    q.actividad = new mongoose.Types.ObjectId(filter.actividad);
  }

  if (filter.mes != null) q.mes = Number(filter.mes);
  if (filter.trimestre != null) q.trimestre = Number(filter.trimestre);
  if (filter.anio != null) q.anio = Number(filter.anio);
  if (filter.estado) q.estado = filter.estado;

  if (filter.responsables) {
    let arr = filter.responsables;
    if (typeof arr === "string") {
      arr = arr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (!Array.isArray(arr) || !arr.length)
      throw new Error("Responsables no proporcionados");
    const objIds = arr.map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id))
        throw new Error("ID de responsable inválido");
      return new mongoose.Types.ObjectId(id);
    });
    q.responsables = { $in: objIds };
  } else if (filter.responsable) {
    if (!mongoose.Types.ObjectId.isValid(filter.responsable))
      throw new Error("ID de responsable inválido");
    q.responsables = { $in: [new mongoose.Types.ObjectId(filter.responsable)] };
  }

  if (filter.componente) {
    if (!mongoose.Types.ObjectId.isValid(filter.componente))
      throw new Error("ID de componente inválido");
    if (q.actividad) {
      const act = await Actividad.findOne({
        _id: q.actividad,
        componente: filter.componente,
      }).select("_id");
      if (!act)
        return usePagination
          ? { items: [], total: 0, page, totalPages: 0, perPage }
          : [];
      q.actividad = act._id;
    } else {
      const actividades = await Actividad.find({
        componente: filter.componente,
      }).select("_id");
      if (!actividades.length)
        return usePagination
          ? { items: [], total: 0, page, totalPages: 0, perPage }
          : [];
      q.actividad = { $in: actividades.map((a) => a._id) };
    }
  }

  // Lookup para extraer el número inicial del nombre de la actividad (orden secundario)
  // Ajustar 'actividads' si el nombre real de la colección difiere.
  const lookupActividadOrden = {
    $lookup: {
      from: "actividads",
      localField: "actividad",
      foreignField: "_id",
      as: "_actOrden",
    },
  };
  const addActividadNumero = {
    $addFields: {
      _actNombre: { $arrayElemAt: ["$_actOrden.nombre", 0] },
      _actNumero: {
        $let: {
          vars: {
            match: {
              $regexFind: {
                input: { $arrayElemAt: ["$_actOrden.nombre", 0] },
                regex: /^(\d+)/,
              },
            },
          },
          in: {
            $cond: [
              { $ifNull: ["$$match", false] },
              { $toInt: { $arrayElemAt: ["$$match.captures", 0] } },
              999999,
            ],
          },
        },
      },
    },
  };
  const sortStage = {
    $sort: {
      trimestre: 1, // 1 -> 4
      _actNumero: 1, // Número inicial extraído del nombre de la actividad
      _id: 1, // Desempate estable
    },
  };
  const projectStage = { $project: { __v: 0, _actOrden: 0 } };

  if (usePagination) {
    const skip = (page - 1) * perPage;
    const pipeline = [
      { $match: q },
      lookupActividadOrden,
      addActividadNumero,
      sortStage,
      {
        $facet: {
          metadata: [{ $count: "total" }],
          items: [{ $skip: skip }, { $limit: perPage }, projectStage],
        },
      },
    ];
    const aggResult = await Evidencia.aggregate(pipeline);
    const meta = aggResult[0]?.metadata?.[0] || { total: 0 };
    let items = aggResult[0]?.items || [];

    // Populate real (actividad + componente, responsables)
    items = await Evidencia.populate(items, [
      { path: "actividad", populate: { path: "componente" } },
      { path: "responsables" },
    ]);

    items = items.map((d) => (d.toObject ? d.toObject() : d));
    const total = meta.total;
    const totalPages = Math.ceil(total / perPage);
    return { items, total, page, totalPages, perPage };
  }

  // Sin paginación
  let list = await Evidencia.aggregate([
    { $match: q },
    lookupActividadOrden,
    addActividadNumero,
    sortStage,
    projectStage,
  ]);

  list = await Evidencia.populate(list, [
    { path: "actividad", populate: { path: "componente" } },
    { path: "responsables" },
  ]);

  list = list.map((d) => (d.toObject ? d.toObject() : d));
  return list;
};

const getTasksGroupedByComponente = async (filter = {}) => {
  const evidencias = await getAllEvidencias(filter);
  const map = new Map();

  for (const ev of evidencias) {
    const evObj = ev.toObject ? ev.toObject() : ev;
    const actividad = evObj.actividad;
    if (!actividad || !actividad.componente) continue;
    const comp = actividad.componente;
    const compId = comp._id.toString();

    if (!map.has(compId)) {
      const compCopy = {
        ...((comp.toObject && comp.toObject()) || comp),
        evidencias: [],
      };
      map.set(compId, compCopy);
    }
    map.get(compId).evidencias.push(evObj);
  }

  // NO volvemos a ordenar para preservar el orden lógico creado en getAllEvidencias
  return Array.from(map.values());
};

const getEvidenciaById = async (id) => {
  if (!id) throw new Error("ID no proporcionado");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
  const doc = await Evidencia.findById(id)
    .populate({ path: "actividad", populate: { path: "componente" } })
    .populate("responsables")
    .select("-__v");
  if (!doc) throw new Error("Evidencia no encontrada");
  return doc;
};

export default {
  createEvidencia,
  getAllEvidencias,
  getEvidenciaById,
  getTasksGroupedByComponente,
  /**
   * Obtiene las actividades distintas asociadas a evidencias de un trimestre.
   * @param {number} trimestre
   * @returns {Promise<Array>} Array de actividades
   */
  async getActividadesByTrimestre(trimestre) {
    if (trimestre == null) throw new Error("Trimestre no proporcionado");
    // Buscar evidencias del trimestre
    const evidencias = await Evidencia.find({ trimestre }).select("actividad");
    const actividadIds = [
      ...new Set(
        evidencias.map((ev) => ev.actividad?.toString()).filter(Boolean)
      ),
    ];
    if (!actividadIds.length) return [];
    const Actividad = (
      await import("../../../models/evidence/actividadModel.js")
    ).default;
    const actividades = await Actividad.find({
      _id: { $in: actividadIds },
    }).select("-__v");
    return actividades;
  },

  async updateEvidenciaEstado(id, estado, entregadoEn, justificacion) {
    if (!id) throw new Error("ID no proporcionado");
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
    if (!estado) throw new Error("Estado no proporcionado");
    const evidenciaActual = await Evidencia.findById(id);
    if (!evidenciaActual) throw new Error("Evidencia no encontrada");
    let nuevoEntregadoEn = evidenciaActual.entregadoEn;
    let nuevoEstado = estado;
    if (estado === "Entregada" || estado === "Entrega Extemporanea") {
      if (!entregadoEn)
        throw new Error("Debe proporcionar la fecha de entrega (entregadoEn)");
      nuevoEntregadoEn = entregadoEn;
      // Validar si la entrega es extemporánea
      const fechaMaxima = evidenciaActual.fechaEntrega;
      if (
        nuevoEntregadoEn &&
        fechaMaxima &&
        new Date(nuevoEntregadoEn) > new Date(fechaMaxima)
      ) {
        nuevoEstado = "Entrega Extemporanea";
      } else if (estado === "Entrega Extemporanea") {
        nuevoEstado = "Entrega Extemporanea";
      } else {
        nuevoEstado = "Entregada";
      }
    } else {
      // Si el estado es "No logro" requerimos justificación
      if (
        estado.toLowerCase() === "no logro" ||
        estado === "No logro" ||
        estado === "No logro"
      ) {
        if (!justificacion || String(justificacion).trim() === "") {
          throw new Error(
            "Se requiere justificacion cuando el estado es 'No logro'"
          );
        }
      }
      nuevoEntregadoEn = null;
    }
    const doc = await Evidencia.findByIdAndUpdate(
      id,
      {
        estado: nuevoEstado,
        entregadoEn: nuevoEntregadoEn,
        ...(estado.toLowerCase() === "no logro" || estado === "No logro"
          ? { justificacion }
          : {}),
      },
      { new: true }
    )
      .populate({ path: "actividad", populate: { path: "componente" } })
      .populate("responsables")
      .select("-__v");
    if (!doc) throw new Error("Evidencia no encontrada");

    // Sincronización actualización
    if (shouldAwaitSheetSync()) {
      try {
        await runWithTimeout(
          () => updateEvidenciaInSheet(doc),
          "Update evidencia",
          doc._id
        );
      } catch (err) {
        // ya logueado dentro de runWithTimeout
      }
    } else {
      updateEvidenciaInSheet(doc)
        .then(() =>
          console.log(`[Sheets] (async) Update evidencia ${doc._id} OK`)
        )
        .catch((err) =>
          console.error(
            `[Sheets] (async) Update evidencia ${doc._id} ERROR:`,
            err.message
          )
        );
    }

    return doc;
  },
};
