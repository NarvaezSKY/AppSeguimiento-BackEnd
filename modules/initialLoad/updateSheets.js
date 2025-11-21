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

// Configurar archivo temporal de credenciales si viene del ENV
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

// === Inicialización de Google Sheets API ===
const auth = new google.auth.GoogleAuth({ 
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});
const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = "17TpmJhyTSxlN6mPx7ABP-a_Kh2det__fBwhG-B-FQoM"; // <-- tu ID

// === Utilidades ===
const parseDate = (str) => {
  const d = new Date(str);
  return isNaN(d) ? null : d;
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  // Formatear en zona horaria local para evitar problemas de UTC
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// === Lógica principal ===
export async function updateEvidenciasInSheet() {
  try {
    // Verificar autenticación antes de proceder
    console.log("Verificando autenticación...");
    const client = await auth.getClient();
    if (!client) throw new Error("auth.getClient() returned falsy client");

    let gotToken = false;
    if (typeof client.getAccessToken === "function") {
      const tk = await client.getAccessToken();
      gotToken = true;
    } else if (typeof client.getRequestHeaders === "function") {
      const headers = await client.getRequestHeaders();
      gotToken = true;
    }

    if (!gotToken) console.warn("DEBUG: no token method succeeded — Sheets calls may fail");

    console.log("Leyendo datos desde Google Sheets...");
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Hoja1!A1:Z", // Ajusta si tienes más columnas
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
    const tipoCol = colIndex("Tipo Evidencia");

    if ([fechaEntregaCol, entregadoEnCol, estadoCol, tipoCol].includes(-1)) {
      console.log("Columnas encontradas:", header);
      console.log("Índices:", { fechaEntregaCol, entregadoEnCol, estadoCol, tipoCol });
      throw new Error("No se encontraron columnas esperadas en el Sheet");
    }

    console.log("Procesando filas...");

    const updatedData = data.map((row, index) => {
      const fechaEntregaStr = row[fechaEntregaCol]?.trim();
      const entregadoEnStr = row[entregadoEnCol]?.trim();
      const estadoActual = row[estadoCol]?.trim();

      if (!fechaEntregaStr) {
        console.log(`Fila ${index + 2}: Sin fecha de entrega, omitiendo`);
        return row;
      }

      const fechaEntrega = parseDate(fechaEntregaStr);
      if (!fechaEntrega) {
        console.log(`Fila ${index + 2}: Fecha de entrega inválida (${fechaEntregaStr}), omitiendo`);
        return row;
      }

      // Crear nueva fecha con día 15, manteniendo mes y año exactos
      const nuevaFecha = new Date(fechaEntrega.getFullYear(), fechaEntrega.getMonth(), 15);

      // Recalcular estado basado en entregadoEn vs nueva fecha
      let nuevoEstado = estadoActual;
      if (entregadoEnStr) {
        const entregadoEn = parseDate(entregadoEnStr);
        if (entregadoEn) {
          // Comparar solo las fechas (sin hora) para evitar problemas de zona horaria
          const entregadoEnFecha = new Date(entregadoEn.getFullYear(), entregadoEn.getMonth(), entregadoEn.getDate());
          const nuevaFechaComparar = new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth(), nuevaFecha.getDate());
          
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

      console.log(`Fila ${index + 2}: ${fechaEntregaStr} → ${formatDate(nuevaFecha)}, Estado: ${estadoActual} → ${nuevoEstado}`);

      return row;
    });

    // Enviar de vuelta a Sheets
    console.log("Actualizando Google Sheet...");
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Hoja1!A2`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: updatedData },
    });

    console.log("✅ Actualización completada correctamente.");
  } catch (err) {
    console.error("❌ Error al actualizar el Sheet:", err);
    throw err;
  }
}

// Ejecutar directamente si se llama desde CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  updateEvidenciasInSheet();
}
