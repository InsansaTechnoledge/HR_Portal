
import fs from "fs";
import { google } from "googleapis";
import oauth2Client from "../config/googleAuth.js";

export const uploadToGoogleDrive = async (filePath, fileName, refreshToken, folderId) => {
  if (!refreshToken) {
    throw new Error("Google Drive refresh token missing");
  }

  // THIS is the key fix
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: folderId ? [folderId] : [],
    },
    media: {
       body: fs.createReadStream(filePath),
    },
    fields: "id, webViewLink",
  });

  return response.data.webViewLink;
};

export default uploadToGoogleDrive;
