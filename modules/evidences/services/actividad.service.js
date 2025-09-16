import Actividad from "../../../models/evidence/actividadModel.js";
import Componente from "../../../models/evidence/componenteModel.js";
import Evidencia from "../../../models/evidence/evidenciaModel.js";
import mongoose from "mongoose";

const createActividad = async (data) => {
  const { actividad, metaAnual, componente } = data || {};
  if (!actividad || metaAnual == null || !componente) throw new Error("Faltan campos obligatorios");
  const comp = await Componente.findById(componente);
  if (!comp) throw new Error("Componente no encontrado");
  const doc = new Actividad({ actividad, metaAnual, componente });
  await doc.save();
  const obj = doc.toObject();
  delete obj.__v;
  return obj;
};

const getAllActividades = async () => {
  return await Actividad.find().populate("componente").select("-__v");
};

const getActividadById = async (id) => {
  if (!id) throw new Error("ID no proporcionado");
  const doc = await Actividad.findById(id).populate("componente").select("-__v");
  if (!doc) throw new Error("Actividad no encontrada");
  return doc;
};

// nuevo: obtiene actividades en las que el usuario tiene evidencias asignadas
const getActividadesByResponsable = async (userId) => {
  if (!userId) throw new Error("ID de usuario no proporcionado");
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("ID de usuario inválido");
  // buscar evidencias donde el usuario aparece como responsable
  const evidencias = await Evidencia.find({ responsables: userId }).select("actividad");
  const actividadIds = [...new Set(evidencias.map(ev => ev.actividad?.toString()).filter(Boolean))];
  if (!actividadIds.length) return [];
  const actividades = await Actividad.find({ _id: { $in: actividadIds } })
    .populate("componente")
    .select("-__v");
  return actividades;
};

export default { createActividad, getAllActividades, getActividadById, getActividadesByResponsable };