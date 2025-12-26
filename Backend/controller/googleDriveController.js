import oauth2Client from "../config/googleAuth.js";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";

export const googleAuthUrl = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/drive.file"],
      state: req.user.id, // save user id
    });

    res.json({ url });
  } catch (error) {
    console.error("Error generating Google OAuth URL:", error);
    res.status(500).json({ error: "Failed to generate Google OAuth URL" });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    const { tokens } = await oauth2Client.getToken(code);

    // Get existing user
    const user = await User.findById(state);
    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_ORIGIN}/application?error=user_not_found`
      );
    }

    // Use new refresh token OR keep old one
    const refreshToken = tokens.refresh_token || user.googleDrive?.refreshToken;

    if (!refreshToken) {
      return res.redirect(
        `${process.env.CLIENT_ORIGIN}/application?error=no_refresh_token`
      );
    }

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
      access_token: tokens.access_token,
    });

    await User.findByIdAndUpdate(state, {
      googleDrive: {
        refreshToken,
        email: "Connected",
        connectedAt: new Date(),
      },
    });

    // SUCCESS REDIRECT
    res.redirect(`${process.env.CLIENT_ORIGIN}/application?connected=google`);
  } catch (err) {
    console.error("Google callback error:", err);
    res.redirect(
      `${process.env.CLIENT_ORIGIN}/application?error=google_connection_failed`
    );
  }
};

// Returns whether the current user has a stored Google Drive refresh token
export const googleDriveStatus = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID not found" });
    }
    
    const user = await User.findById(userId).select("googleDrive.refreshToken");
    const connected = Boolean(user?.googleDrive?.refreshToken);
    return res.json({ connected });
  } catch (error) {
    console.error("Error checking Google Drive status:", error);
    return res.status(500).json({ message: "Failed to check Google Drive status" });
  }
};

// Disconnect Google Drive by removing the stored refresh token
export const googleDriveDisconnect = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID not found" });
    }

    const result = await User.findByIdAndUpdate(userId, {
      $unset: { "googleDrive.refreshToken": 1 },
      $set: {
        "googleDrive.email": "Disconnected",
        "googleDrive.connectedAt": null,
      },
    });

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ connected: false, message: "Google Drive disconnected" });
  } catch (error) {
    console.error("Error disconnecting Google Drive:", error);
    return res.status(500).json({ message: "Failed to disconnect Google Drive", error: error.message });
  }
};
