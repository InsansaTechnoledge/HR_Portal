import { Client } from "@microsoft/microsoft-graph-client";

export const uploadToOneDrive = async (
  accessToken,
  buffer,
  fileName,
  jobId
) => {
  if (!accessToken) throw new Error("Access token missing");
  console.log(accessToken)

  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  console.log(safeFileName)
  const client = Client.init({
    authProvider: (done) => done(null, accessToken),
  });

  const uploadPath = `/drive/root:/Resumes/${safeFileName}:/content`;

  console.log("Uploading to:", uploadPath);
  console.log("File size:", buffer.length);
  const response = await client.api(uploadPath).put(buffer);

  return response.webUrl;
};
