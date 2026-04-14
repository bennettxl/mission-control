import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });

import { google } from "googleapis";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
  }
  const json = raw.startsWith("{") ? raw : readFileSync(raw, "utf8");
  const credentials = JSON.parse(json);
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Service account JSON missing client_email or private_key");
  }
  const key = credentials.private_key.replace(/\\n/g, "\n");
  const scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
  ];
  const jwt = new google.auth.JWT({ email: credentials.client_email, key, scopes });
  return { jwt, clientEmail: credentials.client_email };
}

async function findMissionControlFolder(drive: ReturnType<typeof google.drive>) {
  const configured = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (configured) return configured;

  const response = await drive.files.list({
    q: "mimeType = 'application/vnd.google-apps.folder' and name = 'Mission Control' and trashed = false",
    fields: "files(id,name)",
    pageSize: 5,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  const files = response.data.files ?? [];
  if (files.length === 0) {
    return null;
  }
  if (files.length > 1) {
    console.warn(`Found ${files.length} folders named 'Mission Control'. Using the first (${files[0].id}).`);
  }
  return files[0].id ?? null;
}

function loadCsvRows() {
  const csvPath = resolve("data", "a3-duplicate-review-2026-03-25.csv");
  const raw = readFileSync(csvPath, "utf8");
  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const matches = [...line.matchAll(/"([^"]*)"|([^,]+)/g)];
      return matches.map((match) => (match[1] ?? match[2] ?? ""));
    });
}

async function main() {
  const { jwt } = loadServiceAccount();
  const drive = google.drive({ version: "v3", auth: jwt });
  const sheets = google.sheets({ version: "v4", auth: jwt });

  const folderId = await findMissionControlFolder(drive);
  if (!folderId) {
    console.warn("Mission Control folder not found; sheet will be created in the service account's root.");
  }

  const title = `A3 Duplicate Review ${new Date().toISOString().split("T")[0]}`;
  const sheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [{ properties: { title: "Duplicates" } }],
    },
    fields: "spreadsheetId,spreadsheetUrl",
  });

  const spreadsheetId = sheet.data.spreadsheetId;
  if (!spreadsheetId) {
    throw new Error("Failed to obtain spreadsheetId from Sheets API");
  }

  if (folderId) {
    const metadata = await drive.files.get({ fileId: spreadsheetId, fields: "parents" });
    const previousParents = metadata.data.parents?.join(",");
    await drive.files.update({
      fileId: spreadsheetId,
      addParents: folderId,
      removeParents: previousParents ?? undefined,
    });
  }

  const values = loadCsvRows();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Duplicates!A1",
    valueInputOption: "RAW",
    requestBody: { values },
  });

  console.log(`Created sheet ${sheet.data.spreadsheetUrl}`);
}

main().catch((error) => {
  console.error("Failed to publish duplicate review", error?.response?.data ?? error);
  process.exit(1);
});
