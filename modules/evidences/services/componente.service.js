import mongoose from "mongoose";
import Componente from "../../../models/evidence/componenteModel.js";

/**
 * Crea un componente.
 * @param {{nombreComponente:string}} data
 */
const createComponente = async (data) => {
  const { nombreComponente } = data || {};
  if (!nombreComponente) throw new Error("Faltan campos obligatorios");
  // búsqueda case-insensitive para evitar duplicados por mayúsculas/minúsculas
  const escaped = nombreComponente.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const exists = await Componente.findOne({ nombreComponente: { $regex: `^${escaped}$`, $options: "i" } });
  if (exists) throw new Error("Componente ya registrado");
  const doc = new Componente({ nombreComponente });
  await doc.save();
  const result = doc.toObject();
  delete result.__v;
  return result;
};

const getAllComponentes = async () => {
  const docs = await Componente.find().select("-__v");
  return docs;
};

const getComponenteById = async (id) => {
  if (!id) throw new Error("ID no proporcionado");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
  const doc = await Componente.findById(id).select("-__v");
  if (!doc) throw new Error("Componente no encontrado");
  return doc;
};

const getComponenteByName = async (name) => {
  if (!name) throw new Error("Nombre no proporcionado");
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");  
  const doc = await Componente.findOne({ nombreComponente: { $regex: escaped, $options: "i" } }).select("-__v");
  if (!doc) throw new Error("Componente no encontrado");
  return doc;
};

export default {
  createComponente,
  getAllComponentes,
  getComponenteById,
  getComponenteByName,
};