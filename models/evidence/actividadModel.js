import mongoose from "mongoose";

const actividadSchema = new mongoose.Schema({
  actividad: { type: String, required: true },
  metaAnual: { type: Number, required: true },
  componente: { type: mongoose.Schema.Types.ObjectId, ref: "Componente" },
});

export default mongoose.model("Actividad", actividadSchema);
