import mongoose from "mongoose";

const evidenciaSchema = new mongoose.Schema({
    componente: { type: mongoose.Schema.Types.ObjectId, ref: "Componente", required: true },
    tipoEvidencia: { type: String, required: true },
    mes: { type: Number, required: true },
    anio: { type: Number, required: true },
    responsables: [{ type: mongoose.Schema.Types.ObjectId, ref: "Responsable" }],
    estado: { type: String, enum: ["Pendiente", "En progreso", "Completada"], default: "Pendiente" },
    fechaEntrega: { type: Date, required: true },
    creadoEn: { type: Date, default: Date.now }
});

export default mongoose.model("Evidencia", evidenciaSchema);
