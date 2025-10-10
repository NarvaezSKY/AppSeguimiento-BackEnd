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
const getActividadesByResponsable = async (userId, idComponente = null) => {
  if (!userId) throw new Error("ID de usuario no proporcionado");
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("ID de usuario inválido");
  
  // Validar componente si se proporciona
  if (idComponente) {
    if (!mongoose.Types.ObjectId.isValid(idComponente)) throw new Error("ID de componente inválido");
    const comp = await Componente.findById(idComponente);
    if (!comp) throw new Error("Componente no encontrado");
  }
  
  // buscar evidencias donde el usuario aparece como responsable
  const evidencias = await Evidencia.find({ responsables: userId }).select("actividad");
  const actividadIds = [...new Set(evidencias.map(ev => ev.actividad?.toString()).filter(Boolean))];
  if (!actividadIds.length) return [];
  
  // Construir query para actividades
  const query = { _id: { $in: actividadIds } };
  
  // Agregar filtro por componente si se proporciona
  if (idComponente) {
    query.componente = new mongoose.Types.ObjectId(idComponente);
  }
  
  const actividades = await Actividad.find(query)
    .populate("componente")
    .select("-__v");
    
  return actividades;
};



export default { createActividad, getAllActividades, getActividadById, getActividadesByResponsable };