import componenteService from "../services/componente.service.js";

const create = async (req, res) => {
  try {
    const item = await componenteService.createComponente(req.body);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    let status = 500;
    if (err.message.includes("Faltan")) status = 400;
    if (err.message.includes("ya registrado")) status = 409;
    if (err.message.includes("no proporcionado")) status = 400;
    if (err.message.includes("no encontrado")) status = 404;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const items = await componenteService.getAllComponentes();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await componenteService.getComponenteById(id);
    return res.json({ success: true, data: item });
  } catch (err) {
    const status = err.message.includes("no proporcionado") ? 400 : err.message.includes("no encontrado") ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const getByName = async (req, res) => {
  try {
    const { nombre } = req.params;
    const item = await componenteService.getComponenteByName(nombre);
    return res.json({ success: true, data: item });
  } catch (err) {
    const status = err.message.includes("no proporcionado") ? 400 : err.message.includes("no encontrado") ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

const getUniqueComponentes = async (req, res) => {
  try {
    const items = await componenteService.getUniqueComponentes();
    return res.json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default { create, getAll, getById, getByName, getUniqueComponentes };