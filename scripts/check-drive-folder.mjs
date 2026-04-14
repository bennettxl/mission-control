import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';

const folderId = process.env.MC_DRIVE_FOLDER_ID || '1RKLmyS59w2iL5GhhTzdGjFGyJdCCARXJ';
const keyPath = process.env.MC_DRIVE_SA_PATH || path.resolve('../secrets/mission-control-drive-sa.json');
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

async function main() {
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });
  await auth.authorize();
  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, modifiedTime)',
    pageSize: 20
  });
  if (!res.data.files || res.data.files.length === 0) {
    console.log('Folder reachable but empty.');
  } else {
    console.log(`Folder reachable. ${res.data.files.length} file(s):`);
    res.data.files.forEach((file) => {
      console.log(`${file.name} (${file.id}) - ${file.mimeType} - ${file.modifiedTime}`);
    });
  }
}

main().catch((err) => {
  console.error('Drive access failed:', err.response ? err.response.data : err.message);
  process.exitCode = 1;
});
