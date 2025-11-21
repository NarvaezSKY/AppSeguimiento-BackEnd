import { google } from "googleapis";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import os from "os";

dotenv.config();

// 🔧 === Configuración de credenciales ===
const parseEnvJson = (raw) => {
  if (!raw) return null;
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    raw = raw.slice(1, -1);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const attempt = raw.replace(/\\\\n/g, "\\n").replace(/\\\\r\\\\n/g, "\\r\\n");
    parsed = JSON.parse(attempt);
  }
  if (parsed && typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").trim();
  }
  return parsed;
};

const credEnv = process.env.GOOGLE_CREDENTIALS;
const credentials = credEnv
  ? parseEnvJson(credEnv)
  : JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "config", "google-credentials.json"), "utf-8"));

if (!credentials || !credentials.private_key || !credentials.client_email) {
  throw new Error("Google credentials missing or invalid");
}

if (credEnv && credentials) {
  try {
    const tmpDir = path.join(os.tmpdir(), "appseguimientocmr-creds");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const tempCredPath = path.join(tmpDir, `google-credentials-${Date.now()}.json`);
    fs.writeFileSync(tempCredPath, JSON.stringify(credentials), { encoding: "utf8", mode: 0o600 });
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredPath;
  } catch (err) {
    console.error("DEBUG: error writing temp credentials file:", err);
    throw err;
  }
}

const auth = new google.auth.GoogleAuth({ 
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});
const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = "17TpmJhyTSxlN6mPx7ABP-a_Kh2det__fBwhG-B-FQoM";

const parseDate = (str) => {
  const d = new Date(str);
  return isNaN(d) ? null : d;
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isFechaOctubre2025 = (fechaStr) => {
  if (!fechaStr) return false;
  return fechaStr.trim() === "2025-10-01";
};

export async function updateOctubreASeptiembre() {
  try {
    console.log("🔄 Cambiando fechas de 01/10/2025 a 01/09/2025...");
    
    console.log("Verificando autenticación...");
    const client = await auth.getClient();
    if (!client) throw new Error("auth.getClient() returned falsy client");

    console.log("Leyendo datos desde Google Sheets...");
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Hoja1!A1:Z",
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.error("No se encontraron filas en el Sheet");
      return;
    }

    const header = rows[0];
    const data = rows.slice(1);

    const colIndex = (name) => header.indexOf(name);
    const fechaEntregaCol = colIndex("Fecha Entrega");
    const entregadoEnCol = colIndex("Entregado En");
    const estadoCol = colIndex("Estado");

    if ([fechaEntregaCol, entregadoEnCol, estadoCol].includes(-1)) {
      console.log("Columnas encontradas:", header);
      throw new Error("No se encontraron columnas esperadas en el Sheet");
    }

    console.log("Procesando filas...");
    let actualizadas = 0;

    const updatedData = data.map((row, index) => {
      const fechaEntregaStr = row[fechaEntregaCol]?.trim();
      const entregadoEnStr = row[entregadoEnCol]?.trim();
      const estadoActual = row[estadoCol]?.trim();

      // Verificar si es una fecha de 01/10/2025
      if (!isFechaOctubre2025(fechaEntregaStr)) {
        return row; // No modificar si no es 01/10/2025
      }

      // Nueva fecha: 01/09/2025
      const nuevaFecha = new Date(2025, 8, 1); // Septiembre = mes 8 (0-indexado)

      // Recalcular estado basado en entregadoEn vs nueva fecha
      let nuevoEstado = estadoActual;
      if (entregadoEnStr) {
        const entregadoEn = parseDate(entregadoEnStr);
        if (entregadoEn) {
          const entregadoEnFecha = new Date(entregadoEn.getFullYear(), entregadoEn.getMonth(), entregadoEn.getDate());
          const nuevaFechaComparar = new Date(2025, 8, 1); // 01/09/2025
          
          if (entregadoEnFecha <= nuevaFechaComparar) {
            nuevoEstado = "Entregada";
          } else {
            nuevoEstado = "Entrega Extemporanea";
          }
        }
      }

      // Actualizar valores en la fila
      row[fechaEntregaCol] = formatDate(nuevaFecha);
      row[estadoCol] = nuevoEstado;

      actualizadas++;
      console.log(`✅ Fila ${index + 2}: ${fechaEntregaStr} → ${formatDate(nuevaFecha)}, Estado: ${estadoActual} → ${nuevoEstado}`);

      return row;
    });

    if (actualizadas === 0) {
      console.log("⚠️  No se encontraron evidencias del 01/10/2025 para actualizar");
      return;
    }

    // Enviar de vuelta a Sheets
    console.log(`Actualizando ${actualizadas} evidencias en Google Sheet...`);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Hoja1!A2`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: updatedData },
    });

    console.log(`✅ Actualización completada. ${actualizadas} evidencias actualizadas de octubre → septiembre 2025.`);
  } catch (err) {
    console.error("❌ Error al actualizar fechas:", err);
    throw err;
  }
}