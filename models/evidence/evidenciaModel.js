import mongoose from "mongoose";

const evidenciaSchema = new mongoose.Schema({
  actividad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Actividad",
    required: true,
  },
  tipoEvidencia: { type: String, required: true },
  trimestre: { type: Number, required: true },
  mes: { type: Number, required: true },
  anio: { type: Number, required: true },
  responsables: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  estado: {
    type: String,
    enum: ["Entregada", "Por entregar", "Entrega Extemporanea", "No logro"],
    default: "Por entregar",
  },
  fechaEntrega: { type: Date, required: true },
  creadoEn: { type: Date, default: Date.now },
  entregadoEn: { type: Date, default: null },
  justificacion: { type: String, default: "" },
});

export default mongoose.model("Evidencia", evidenciaSchema);
