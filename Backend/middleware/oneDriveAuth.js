import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const getOneDriveToken = async (req, res, next) => {
  try {
    const response = await axios.post(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    req.oneDriveToken = response.data.access_token;
    next();
  } catch (error) {
    console.error("OneDrive token error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to get OneDrive access token" });
  }
};
