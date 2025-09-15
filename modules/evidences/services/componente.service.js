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
  /**
   * Obtiene los usuarios responsables de evidencias asociadas a actividades de un componente.
   * @param {string} componenteId
   * @returns {Promise<Array>} Array de usuarios únicos
   */
  async getResponsablesByComponente(componenteId) {
    if (!componenteId) throw new Error("ID de componente no proporcionado");
    if (!mongoose.Types.ObjectId.isValid(componenteId)) throw new Error("ID de componente inválido");
    // Buscar actividades del componente
    const Actividad = (await import("../../../models/evidence/actividadModel.js")).default;
    const Evidencia = (await import("../../../models/evidence/evidenciaModel.js")).default;
    const User = (await import("../../../models/userModel.js")).default;
    const actividades = await Actividad.find({ componente: componenteId }).select("_id");
    if (!actividades.length) return [];
    const actividadIds = actividades.map(a => a._id);
    // Buscar evidencias de esas actividades
    const evidencias = await Evidencia.find({ actividad: { $in: actividadIds } }).select("responsables");
    const userIds = new Set();
    for (const ev of evidencias) {
      (ev.responsables || []).forEach(id => userIds.add(id.toString()));
    }
    if (!userIds.size) return [];
    // Buscar usuarios únicos
    const usuarios = await User.find({ _id: { $in: Array.from(userIds) } }).select("-__v");
    return usuarios;
  },
};