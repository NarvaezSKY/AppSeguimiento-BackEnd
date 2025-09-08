import Evidencia from "../../../models/evidence/evidenciaModel.js";
import Actividad from "../../../models/evidence/actividadModel.js";
import mongoose from "mongoose";

/**
 * Crea evidencia referenciando actividad.
 */
const createEvidencia = async (data) => {
  const { actividad, tipoEvidencia, mes, anio, fechaEntrega, responsables, estado } = data || {};
  if (!actividad || !tipoEvidencia || mes == null || anio == null || !fechaEntrega) throw new Error("Faltan campos obligatorios");
  if (!mongoose.Types.ObjectId.isValid(actividad)) throw new Error("ID de actividad inválido");
  const act = await Actividad.findById(actividad).populate("componente");
  if (!act) throw new Error("Actividad no encontrada");
  const doc = new Evidencia({ actividad, tipoEvidencia, mes, anio, fechaEntrega, responsables: responsables || [], estado: estado || undefined });
  await doc.save();
  await doc.populate({ path: "actividad", populate: { path: "componente" } });
  await doc.populate("responsables");
  const obj = doc.toObject();
  delete obj.__v;
  return obj;
};

/**
 * Obtiene evidencias; si se filtra por componente, primero se obtienen las actividades de ese componente.
 */
const getAllEvidencias = async (filter = {}) => {
  const q = {};
  if (filter.actividad) q.actividad = filter.actividad;
  if (filter.mes != null) q.mes = Number(filter.mes);
  if (filter.anio != null) q.anio = Number(filter.anio);
  if (filter.estado) q.estado = filter.estado;

  if (filter.componente) {
    // validar id y obtener actividades del componente
    if (!mongoose.Types.ObjectId.isValid(filter.componente)) throw new Error("ID de componente inválido");
    const actividades = await Actividad.find({ componente: filter.componente }).select("_id");
    if (!actividades.length) return []; // no hay actividades → no hay evidencias
    q.actividad = { $in: actividades.map(a => a._id) };
  }

  const list = await Evidencia.find(q)
    .populate({ path: "actividad", populate: { path: "componente" } })
    .populate("responsables")
    .select("-__v");

  return list;
};

/**
 * Agrupa evidencias por componente (a través de actividad.componente).
 */
const getTasksGroupedByComponente = async (filter = {}) => {
  const evidencias = await getAllEvidencias(filter);

  const map = new Map();
  for (const ev of evidencias) {
    const evObj = ev.toObject();
    const actividad = evObj.actividad;
    if (!actividad || !actividad.componente) continue;
    const comp = actividad.componente;
    const compId = comp._id.toString();

    if (!map.has(compId)) {
      const compCopy = { ...comp, evidencias: [] };
      map.set(compId, compCopy);
    }

    map.get(compId).evidencias.push(evObj);
  }

  return Array.from(map.values());
};

const getEvidenciaById = async (id) => {
  if (!id) throw new Error("ID no proporcionado");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
  const doc = await Evidencia.findById(id).populate({ path: "actividad", populate: { path: "componente" } }).populate("responsables").select("-__v");
  if (!doc) throw new Error("Evidencia no encontrada");
  return doc;
};

export default {
  createEvidencia,
  getAllEvidencias,
  getEvidenciaById,
  getTasksGroupedByComponente,
};