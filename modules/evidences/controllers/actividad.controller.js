import actividadService from "../services/actividad.service.js";

const create = async (req, res) => {
  try {
    const item = await actividadService.createActividad(req.body);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    const status = err.message.includes("Faltan") ? 400 : err.message.includes("no encontrado") ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const items = await actividadService.getAllActividades();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await actividadService.getActividadById(id);
    return res.json({ success: true, data: item });
  } catch (err) {
    const status = err.message.includes("no proporcionado") ? 400 : err.message.includes("no encontrada") ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export default { create, getAll, getById };