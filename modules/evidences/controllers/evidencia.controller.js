import evidenciaService from "../services/evidencia.service.js";

const create = async (req, res) => {
  try {
    const item = await evidenciaService.createEvidencia(req.body);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    let status = 500;
    if (err.message.includes("Faltan")) status = 400;
    if (err.message.includes("inválid") || err.message.includes("ID inválido")) status = 400;
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
    };
    const items = await evidenciaService.getAllEvidencias(filters);
    return res.json({ success: true, data: items });
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
    const status = err.message.includes("no proporcionado") || err.message.includes("inválid") ? 400 : err.message.includes("no encontrada") ? 404 : 500;
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

export default { create, getAll, getById, getTasksGrouped };