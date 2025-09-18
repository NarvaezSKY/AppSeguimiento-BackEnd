import { google } from "googleapis";
import fs from "fs";
import { getAllEvidenciasFormatted } from "../evidences/services/sheets.service.js";

const credentials = JSON.parse(
  fs.readFileSync("config/google-credentials.json", "utf-8")
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = "17TpmJhyTSxlN6mPx7ABP-a_Kh2det__fBwhG-B-FQoM";

export async function exportEvidenciasToSheet() {
  const values = await getAllEvidenciasFormatted();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Hoja1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  console.log("Evidencias exportadas a Google Sheets ✅");
}
