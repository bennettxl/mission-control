import { google } from "googleapis";
import { readFileSync } from "fs";

export type DriveDocumentRecord = {
  id: string;
  title: string;
  kind: string;
  modifiedAt: string | null;
  link: string | null;
  summary: string | null;
  owners: string[];
};

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

function loadDriveCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  }
  const filePath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  if (!filePath) return null;
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    console.warn(`Failed to read GOOGLE_SERVICE_ACCOUNT_FILE at ${filePath}`, error);
    return null;
  }
}

function getDriveClient() {
  const rawCredentials = loadDriveCredentials();
  if (!rawCredentials) return null;

  let parsed: { client_email?: string; private_key?: string };
  try {
    parsed = JSON.parse(rawCredentials);
  } catch (error) {
    console.warn("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON", error);
    return null;
  }

  if (!parsed.client_email || !parsed.private_key) {
    console.warn("Service account JSON is missing client_email or private_key");
    return null;
  }

  const privateKey = parsed.private_key.replace(/\\n/g, "\n");
  const jwt = new google.auth.JWT({
    email: parsed.client_email,
    key: privateKey,
    scopes: DRIVE_SCOPES,
  });
  const drive = google.drive({ version: "v3", auth: jwt });
  return drive;
}

function mapMimeType(mimeType?: string | null): string {
  if (!mimeType) return "FILE";
  if (mimeType.includes("presentation")) return "DECK";
  if (mimeType.includes("spreadsheet")) return "SHEET";
  if (mimeType.includes("document")) return "DOC";
  if (mimeType.includes("pdf")) return "PDF";
  return mimeType.split("/").pop()?.toUpperCase() ?? "FILE";
}

export async function fetchDriveDocuments(limit = 25): Promise<DriveDocumentRecord[]> {
  const drive = getDriveClient();
  if (!drive) return [];

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const filters = [`trashed = false`];
  if (folderId) {
    filters.push(`'${folderId}' in parents`);
  }

  try {
    const response = await drive.files.list({
      key: process.env.GOOGLE_API_KEY || undefined,
      q: filters.join(" and "),
      fields: "files(id,name,mimeType,modifiedTime,webViewLink,owners(displayName),description)",
      pageSize: limit,
      orderBy: "modifiedTime desc",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = response.data.files ?? [];
    return files.map((file) => ({
      id: file.id!,
      title: file.name ?? "Untitled",
      kind: mapMimeType(file.mimeType),
      modifiedAt: file.modifiedTime ?? null,
      link: file.webViewLink ?? null,
      summary: file.description ?? null,
      owners: (file.owners ?? []).map((owner) => owner?.displayName).filter((name): name is string => Boolean(name)),
    }));
  } catch (error) {
    const details = (error as any)?.response?.data;
    if (details) {
      console.error("Failed to fetch Drive files", JSON.stringify(details, null, 2));
    } else {
      console.error("Failed to fetch Drive files", error);
    }
    return [];
  }
}
