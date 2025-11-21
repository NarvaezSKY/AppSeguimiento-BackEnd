import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { updateEvidenciasInSheet } from "./modules/initialLoad/updateSheets.js"; // ← ajusta la ruta según tu estructura

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI no definido en .env");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB conectado, ejecutando actualización de evidencias en Sheets...");

    await updateEvidenciasInSheet();

    console.log("✅ Actualización completada correctamente.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error en la actualización:", err);
    try { await mongoose.disconnect(); } catch (e) { }
    process.exit(1);
  }
};

run();
