import { google } from "googleapis";
import oauth2Client from "../config/googleAuth.js";

export const getOrCreateFolder = async (folderName, refreshToken) => {
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  //  Check if folder already exists
  const existing = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    fields: "files(id, name)",
  });

  if (existing.data.files.length > 0) {
    return existing.data.files[0].id;
  }

  // Create folder if not found
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  return folder.data.id;
};

export default getOrCreateFolder;