import mongoose from "mongoose";

const componenteSchema = new mongoose.Schema({
  nombreComponente: { type: String, required: true, unique: true },
});

export default mongoose.model("Componente", componenteSchema);
