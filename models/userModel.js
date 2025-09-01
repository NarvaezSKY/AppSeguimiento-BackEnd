import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  vinculacion: { type: String, required: true },
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
