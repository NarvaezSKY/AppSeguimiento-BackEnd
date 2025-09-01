import mongoose from "mongoose";

const componenteSchema = new mongoose.Schema({
  componente: { type: String, required: true, unique: true },
  actividad: { type: String, required: true },
  metaAnual: { type: Number, required: true },
});

export default mongoose.model("Componente", componenteSchema);
