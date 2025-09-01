// ...existing code...
import userService from "../services/user.service.js";

const register = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    let status = 500;
    if (err.message.includes("Faltan")) status = 400;
    if (err.message.includes("ya registrado") || err.message.includes("registrado")) status = 409;
    return res.status(status).json({ success: false, message: err.message });
  }
};

/**
 * GET / - listar todos
 */
const getAll = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /by-name/:nombre - buscar por nombre
 */
const getByName = async (req, res) => {
  try {
    const { nombre } = req.params;
    const user = await userService.getUserByNombre(nombre);
    return res.json({ success: true, data: user });
  } catch (err) {
    const status = err.message.includes("no proporcionado") ? 400 : err.message.includes("no encontrado") ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

/**
 * GET /:id - buscar por id
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    return res.json({ success: true, data: user });
  } catch (err) {
    const status = err.message.includes("no proporcionado") ? 400 : err.message.includes("no encontrado") ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

export default { register, getAll, getByName, getById };