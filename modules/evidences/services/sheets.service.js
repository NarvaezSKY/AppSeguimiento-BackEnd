import evidenciaService from "./evidencia.service.js";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import os from "os";

dotenv.config();

// Función para crear una instancia de Google Sheets usando la misma configuración que initialLoad
const createSheetsInstance = () => {
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
  let credentials = null;

  try {
    credentials = credEnv
      ? parseEnvJson(credEnv)
      : JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "config", "google-credentials.json"), "utf-8"));
  } catch (err) {
    console.warn("Error loading Google credentials for Sheets sync:", err.message);
    return { auth: null, sheets: null, credentials: null };
  }

  if (!credentials || !credentials.private_key || !credentials.client_email) {
    console.warn("Google credentials missing - Sheet sync will be disabled");
    return { auth: null, sheets: null, credentials: null };
  }

  try {
    // Usar exactamente la misma lógica que initialLoad.js
    if (credEnv && credentials) {
      // Solo crear el archivo temporal si no existe ya GOOGLE_APPLICATION_CREDENTIALS
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        const tmpDir = path.join(os.tmpdir(), "appseguimientocmr-creds");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const tempCredPath = path.join(tmpDir, `google-credentials-sheets-${Date.now()}.json`);
        fs.writeFileSync(tempCredPath, JSON.stringify(credentials), { encoding: "utf8", mode: 0o600 });
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredPath;
      }
    }
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: "v4", auth });
    
    return { auth, sheets, credentials };
  } catch (err) {
    console.error("Error initializing Google Sheets API:", err);
    return { auth: null, sheets: null, credentials: null };
  }
};

// Inicializar de manera lazy (cuando se necesite)
let sheetsInstance = null;
const spreadsheetId = "17TpmJhyTSxlN6mPx7ABP-a_Kh2det__fBwhG-B-FQoM";

const getSheetsInstance = () => {
  if (!sheetsInstance) {
    sheetsInstance = createSheetsInstance();
  }
  return sheetsInstance;
};

// Función de test para verificar conectividad (solo para debugging)
export const testSheetsConnection = async () => {
  try {
    const { auth, sheets, credentials } = getSheetsInstance();
    
    if (!sheets || !credentials) {
      console.log("❌ Sheets no disponible para test");
      return false;
    }

    console.log("🔍 Probando conexión a Google Sheets...");
    const client = await auth.getClient();
    if (!client) {
      console.log("❌ No se pudo obtener cliente de autenticación");
      return false;
    }

    // Probar leyendo datos del sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Hoja1!A1:A1",
    });
    
    console.log("✅ Conexión a Google Sheets exitosa");
    return true;
  } catch (error) {
    console.log("❌ Error en conexión a Google Sheets:", error.message);
    return false;
  }
};

export const getAllEvidenciasFormatted = async (filter = {}) => {
  const evidencias = await evidenciaService.getAllEvidencias(filter);

  const rows = evidencias.map((ev) => {
    const responsables = ev.responsables
      .map((r) => `${r.nombre} (${r.email}) [${r.vinculacion}]`)
      .join("; ");

    return [
      ev._id.toString(),
      ev.actividad?.componente?.nombreComponente || "",
      ev.actividad?.actividad?.trim() || "",
      ev.tipoEvidencia || "",
      ev.trimestre ?? "",
      ev.mes ?? "",
      ev.anio ?? "",
      responsables,
      ev.estado || "",
      ev.fechaEntrega ? new Date(ev.fechaEntrega).toISOString().split("T")[0] : "",
      ev.entregadoEn ? new Date(ev.entregadoEn).toISOString() : "",
      ev.creadoEn ? new Date(ev.creadoEn).toISOString() : "",
    ];
  });

  const headers = [
    "ID Evidencia",
    "Componente",
    "Actividad",
    "Tipo Evidencia",
    "Trimestre",
    "Mes",
    "Año",
    "Responsables",
    "Estado",
    "Fecha Entrega",
    "Entregado En",
    "Creado En",
  ];

  return [headers, ...rows];
};

/**
 * Formatea una evidencia individual para Google Sheets
 */
const formatEvidenciaForSheet = (evidencia) => {
  const responsables = evidencia.responsables
    .map((r) => `${r.nombre} (${r.email}) [${r.vinculacion}]`)
    .join("; ");

  return [
    evidencia._id.toString(),
    evidencia.actividad?.componente?.nombreComponente || "",
    evidencia.actividad?.actividad?.trim() || "",
    evidencia.tipoEvidencia || "",
    evidencia.trimestre ?? "",
    evidencia.mes ?? "",
    evidencia.anio ?? "",
    responsables,
    evidencia.estado || "",
    evidencia.fechaEntrega ? new Date(evidencia.fechaEntrega).toISOString().split("T")[0] : "",
    evidencia.entregadoEn ? new Date(evidencia.entregadoEn).toISOString() : "",
    evidencia.creadoEn ? new Date(evidencia.creadoEn).toISOString() : "",
  ];
};

/**
 * Agrega una nueva evidencia como una fila al Google Sheet
 */
export const addEvidenciaToSheet = async (evidencia) => {
  try {
    const { auth, sheets, credentials } = getSheetsInstance();
    
    if (!sheets || !credentials) {
      console.warn("Google Sheets no configurado - saltando sincronización");
      return;
    }

    console.log(`Intentando agregar evidencia ${evidencia._id} al Google Sheet...`);
    
    // Verificar autenticación antes de hacer la llamada
    const client = await auth.getClient();
    if (!client) {
      throw new Error("No se pudo obtener el cliente de autenticación");
    }

    // Probar la autenticación obteniendo un token
    const accessToken = await client.getAccessToken();
    if (!accessToken || !accessToken.token) {
      throw new Error("No se pudo obtener token de acceso");
    }
    
    console.log("✓ Token de autenticación obtenido correctamente");
    console.log("Service Account Email:", credentials.client_email);
    console.log("Spreadsheet ID:", spreadsheetId);
    
    // Verificar que el spreadsheet existe y es accesible
    try {
      const testResponse = await sheets.spreadsheets.get({
        spreadsheetId,
      });
      console.log("✓ Spreadsheet accesible:", testResponse.data.properties.title);
    } catch (testError) {
      console.error("❌ Error accediendo al spreadsheet:", testError.message);
      throw new Error(`El service account no tiene acceso al spreadsheet: ${testError.message}`);
    }

    const row = formatEvidenciaForSheet(evidencia);
    console.log("Fila formateada:", row);
    
    // Agregar la nueva fila al final del sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Hoja1!A:L", // Rango que abarca todas las columnas
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row]
      },
    });
    
    console.log(`✓ Evidencia ${evidencia._id} agregada al Google Sheet exitosamente`);
    return response.data;
  } catch (error) {
    console.error("Error agregando evidencia al Google Sheet:", error.message);
    console.error("Error completo:", error);
    throw error;
  }
};

/**
 * Actualiza una evidencia existente en el Google Sheet
 */
export const updateEvidenciaInSheet = async (evidencia) => {
  try {
    const { auth, sheets, credentials } = getSheetsInstance();
    
    if (!sheets || !credentials) {
      console.warn("Google Sheets no configurado - saltando sincronización");
      return;
    }

    console.log(`Intentando actualizar evidencia ${evidencia._id} en el Google Sheet...`);
    
    // Verificar autenticación antes de hacer la llamada
    const client = await auth.getClient();
    if (!client) {
      throw new Error("No se pudo obtener el cliente de autenticación");
    }

    // Primero, buscar la fila que contiene la evidencia por su ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Hoja1!A:A", // Columna de IDs
    });

    const rows = response.data.values || [];
    const evidenciaId = evidencia._id.toString();
    
    // Encontrar el índice de la fila (saltando el header en índice 0)
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === evidenciaId) {
        rowIndex = i + 1; // +1 porque Google Sheets usa indexación base 1
        break;
      }
    }

    if (rowIndex === -1) {
      console.warn(`Evidencia ${evidenciaId} no encontrada en el sheet - agregando nueva fila`);
      await addEvidenciaToSheet(evidencia);
      return;
    }

    // Actualizar la fila encontrada
    const row = formatEvidenciaForSheet(evidencia);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Hoja1!A${rowIndex}:L${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row]
      },
    });
    
    console.log(`✓ Evidencia ${evidencia._id} actualizada en el Google Sheet (fila ${rowIndex})`);
  } catch (error) {
    console.error("Error actualizando evidencia en Google Sheet:", error.message);
    console.error("Error completo:", error);
    throw error;
  }
};
