// Obtener actividades existentes en un trimestre
const getActividadesByTrimestre = async (req, res) => {
  try {
    const { trimestre } = req.query;
    if (trimestre == null) return res.status(400).json({ success: false, message: "Trimestre no proporcionado" });
    const actividades = await evidenciaService.getActividadesByTrimestre(Number(trimestre));
    return res.json({ success: true, data: actividades });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
import evidenciaService from "../services/evidencia.service.js";

const create = async (req, res) => {
  try {
    const item = await evidenciaService.createEvidencia(req.body);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    let status = 500;
    if (err.message.includes("Faltan")) status = 400;
    if (err.message.includes("inválid") || err.message.includes("ID inválido"))
      status = 400;
    if (err.message.includes("no encontrado")) status = 404;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    // normalizar/parsear query params
    const filters = {
      componente: req.query.componente || undefined,
      actividad: req.query.actividad || undefined,
      mes: req.query.mes != null ? Number(req.query.mes) : undefined,
      anio: req.query.anio != null ? Number(req.query.anio) : undefined,
      estado: req.query.estado || undefined,
      responsable: req.query.responsable || undefined,
      // soportar lista de responsables en query como 'responsables=id1,id2'
      responsables: req.query.responsables || undefined,
      // paginado opcional
      page: req.query.page != null ? Number(req.query.page) : undefined,
      limit: req.query.limit != null ? Number(req.query.limit) : undefined,
      perPage: req.query.perPage != null ? Number(req.query.perPage) : undefined,
      trimestre: req.query.trimestre != null ? Number(req.query.trimestre) : undefined,
    };
    const result = await evidenciaService.getAllEvidencias(filters);
    // devolver tal cual: si el service retorna paginado (obj), lo enviamos.
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await evidenciaService.getEvidenciaById(id);
    return res.json({ success: true, data: item });
  } catch (err) {
    const status =
      err.message.includes("no proporcionado") ||
      err.message.includes("inválid")
        ? 400
        : err.message.includes("no encontrada")
        ? 404
        : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// Nuevo: devuelve tasks agrupadas por componente
const getTasksGrouped = async (req, res) => {
  try {
    const filters = {
      componente: req.query.componente || undefined,
      actividad: req.query.actividad || undefined,
      mes: req.query.mes != null ? Number(req.query.mes) : undefined,
      anio: req.query.anio != null ? Number(req.query.anio) : undefined,
      estado: req.query.estado || undefined,
    };
    const items = await evidenciaService.getTasksGroupedByComponente(filters);
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Actualiza solo el campo 'estado' de una evidencia
export const updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, entregadoEn, justificacion } = req.body;
    const item = await evidenciaService.updateEvidenciaEstado(id, estado, entregadoEn, justificacion);
    return res.json({ success: true, data: item });
  } catch (err) {
    const status =
      err.message.includes("no proporcionado") ||
      err.message.includes("inválid")
        ? 400
        : err.message.includes("no encontrada")
        ? 404
        : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// Agregar al export default
export default { create, getAll, getById, getTasksGrouped, updateEstado, getActividadesByTrimestre };
