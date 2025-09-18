import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { exportEvidenciasToSheet } from "./modules/initialLoad/initialLoad.js";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI no definido en .env");
  process.exit(1);
}

const run = async () => {
  try {
    // conectar a MongoDB antes de usar los servicios que hacen queries
    await mongoose.connect(uri, {
      // opciones compatibles con versiones recientes de mongoose
      // ajusta si usas una versión concreta
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // bufferCommands: false // opcional
    });

    console.log("MongoDB conectado, ejecutando initial load...");

    await exportEvidenciasToSheet();

    console.log("Initial load completado.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error initial load:", err);
    // intentar desconectar si está conectado
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
};

run();