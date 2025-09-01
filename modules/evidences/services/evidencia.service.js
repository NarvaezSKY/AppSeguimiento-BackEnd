import Evidencia from "../../../models/evidence/evidenciaModel.js";
import Componente from "../../../models/evidence/componenteModel.js";
import mongoose from "mongoose";

/**
 * Crea una evidencia. espera componente (id), tipoEvidencia, mes, anio, metaAnual, fechaEntrega, responsables (array de ids opcional)
 */
const createEvidencia = async (data) => {
  const { componente, tipoEvidencia, mes, anio, fechaEntrega, responsables, estado } = data || {};
  if (!componente || !tipoEvidencia || mes == null || anio == null || !fechaEntrega) throw new Error("Faltan campos obligatorios");
  if (!mongoose.Types.ObjectId.isValid(componente)) throw new Error("ID de componente inválido");
  const comp = await Componente.findById(componente);
  if (!comp) throw new Error("Componente no encontrado");
  const doc = new Evidencia({ componente, tipoEvidencia, mes, anio, fechaEntrega, responsables: responsables || [], estado: estado || undefined });
  await doc.save();
  const result = await doc.populate("componente").execPopulate?.() ?? await doc.populate("componente").execPopulate();
  // quitar __v
  const obj = result.toObject();
  delete obj.__v;
  return obj;
};

const getAllEvidencias = async (filter = {}) => {
  const q = {};
  if (filter.componente) q.componente = filter.componente;
  if (filter.mes != null) q.mes = Number(filter.mes);
  if (filter.anio != null) q.anio = Number(filter.anio);
  if (filter.estado) q.estado = filter.estado;
  const list = await Evidencia.find(q).populate("componente responsables").select("-__v");
  return list;
};

const getEvidenciaById = async (id) => {
  if (!id) throw new Error("ID no proporcionado");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID inválido");
  const doc = await Evidencia.findById(id).populate("componente responsables").select("-__v");
  if (!doc) throw new Error("Evidencia no encontrada");
  return doc;
};

export default {
  createEvidencia,
  getAllEvidencias,
  getEvidenciaById,
};