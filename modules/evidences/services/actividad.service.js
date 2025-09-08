import Actividad from "../../../models/evidence/actividadModel.js";
import Componente from "../../../models/evidence/componenteModel.js";

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

export default { createActividad, getAllActividades, getActividadById };