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
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB conectado, ejecutando initial load...");

    await exportEvidenciasToSheet();

    console.log("Initial load completado.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error initial load:", err);
    try { await mongoose.disconnect(); } catch (e) { }
    process.exit(1);
  }
};

run();