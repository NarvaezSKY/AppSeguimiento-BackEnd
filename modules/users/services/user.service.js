import User from "../../../models/userModel.js";

/**
 * Registra un usuario.
 * @param {{nombre:string,email:string,vinculacion:string}} data
 * @returns {Promise<object>}
 */
const registerUser = async (data) => {
  const { nombre, email, vinculacion } = data || {};
  if (!nombre || !email || !vinculacion) throw new Error("Faltan campos obligatorios");

  const existsEmail = await User.findOne({ email });
  if (existsEmail) throw new Error("Email ya registrado");

  const existsNombre = await User.findOne({ nombre });
  if (existsNombre) throw new Error("Nombre ya registrado");

  const user = new User({ nombre, email, vinculacion });
  await user.save();

  const result = user.toObject();
  delete result.__v;
  return result;
};

/**
 * Devuelve todos los usuarios.
 * @returns {Promise<Array>}
 */
const getAllUsers = async () => {
  const users = await User.find().select("-__v");
  return users;
};

/**
 * Devuelve un usuario por ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
const getUserById = async (id) => {
  if (!id) throw new Error("ID no proporcionado");
  const user = await User.findById(id).select("-__v");
  if (!user) throw new Error("Usuario no encontrado");
  return user;
};

/**
 * Devuelve un usuario por nombre (case-insensitive exact match).
 * @param {string} nombre
 * @returns {Promise<object>}
 */
const getUserByNombre = async (nombre) => {
  if (!nombre) throw new Error("Nombre no proporcionado");
  const escaped = nombre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const user = await User.findOne({ nombre: { $regex: escaped, $options: "i" } }).select("-__v");
  if (!user) throw new Error("Usuario no encontrado");
  return user;
};

export default {
  registerUser,
  getAllUsers,
  getUserById,
  getUserByNombre,
};