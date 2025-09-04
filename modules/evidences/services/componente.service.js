import Componente from "../../../models/evidence/componenteModel.js";
/**
 * Crea un componente.
 * @param {{componente:string,actividad:string,metaAnual:number}} data
 */
const createComponente = async (data) => {
  const { componente, actividad, metaAnual } = data || {};
  if (!componente || !actividad) throw new Error("Faltan campos obligatorios");
  const exists = await Componente.findOne({ componente });
  if (exists) throw new Error("Componente ya registrado");
  const doc = new Componente({ componente, actividad, metaAnual });
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
  const doc = await Componente.findById(id).select("-__v");
  if (!doc) throw new Error("Componente no encontrado");
  return doc;
};

const getComponenteByName = async (name) => {
  if (!name) throw new Error("Nombre no proporcionado");
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const doc = await Componente.findOne({ componente: { $regex: escaped, $options: "i" } }).select("-__v");
  if (!doc) throw new Error("Componente no encontrado");
  return doc;
};
/**
 * Devuelve componentes únicos por el campo `componente`.
 * Si hay duplicados, se devuelve el primer documento según el orden definido en $sort.
 * @returns {Promise<Array>}
 */
const getUniqueComponentes = async () => {
  const resultado = await Componente.aggregate([
    { $sort: { componente: 1, _id: 1 } },
    { $group: { _id: "$componente", doc: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$doc" } },
    { $project: { __v: 0 } },
  ]);
  return resultado;
};

export default {
  createComponente,
  getAllComponentes,
  getComponenteById,
  getComponenteByName,
  getUniqueComponentes
};