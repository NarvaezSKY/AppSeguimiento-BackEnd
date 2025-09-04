import mongoose from "mongoose";

const evidenciaSchema = new mongoose.Schema({
    componente: { type: mongoose.Schema.Types.ObjectId, ref: "Componente", required: true },
    tipoEvidencia: { type: String, required: true },
    mes: { type: Number, required: true },
    anio: { type: Number, required: true },
    responsables: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    estado: { type: String, enum: ["Entregada", "Entrega futura", "Por entregar", "Entrega Extemporanea", "No logro"], default: "Por entregar" },
    fechaEntrega: { type: Date, required: true },
    creadoEn: { type: Date, default: Date.now }
});

export default mongoose.model("Evidencia", evidenciaSchema);
