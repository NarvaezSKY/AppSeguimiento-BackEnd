import "../../models/userModel.js";
import "../../models/evidence/evidenciaModel.js";
import "../../models/evidence/actividadModel.js";
import "../../models/evidence/componenteModel.js";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import os from "os";
import { getAllEvidenciasFormatted } from "../evidences/services/sheets.service.js";

dotenv.config();

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
  throw new Error(
    "Google credentials missing or invalid. Set GOOGLE_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON in .env or provide config/google-credentials.json"
  );
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

});

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = "17TpmJhyTSxlN6mPx7ABP-a_Kh2det__fBwhG-B-FQoM";

/**
 * Exporta evidencias a Google Sheets
 */
export async function exportEvidenciasToSheet() {
  try {
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
  } catch (err) {
    console.error("DEBUG: auth token acquisition error:", err);
    throw err;
  }

  const values = await getAllEvidenciasFormatted();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Hoja1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

}
