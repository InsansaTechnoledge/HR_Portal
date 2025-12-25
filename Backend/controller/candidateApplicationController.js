import fs from "fs-extra";
import path from "path";
import CandidateApplication from "../models/candidateApplication.js";
import User from "../models/User.js";
import uploadToGoogleDrive from "../utils/googleDriveUpload.js";
import getOrCreateFolder from "../utils/googleDriveFolder.js";

export const getCandidateApplications = async (req, res) => {
  try {
    const apps = await CandidateApplication.find({}).sort({ createdAt: -1 });
    res.status(200).json({ applications: apps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCandidateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Under Review", "Selected", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await CandidateApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({
      message: "Status updated successfully",
      application: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadResumeController = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const tempPath = req.file?.path;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Resume file is required" });
    }
    const application = await CandidateApplication.findById(applicationId);
    if (!application) {
      if (tempPath) await fs.remove(tempPath);
      return res.status(404).json({ message: "Application not found" });
    }
    const userId = req.user?._id || req.userId || req.user?.id;
    const user = await User.findById(userId).select(
      "+googleDrive.refreshToken"
    );

    if (!user?.googleDrive?.refreshToken) {
      if (tempPath) await fs.remove(tempPath);
      return res.status(400).json({
        message: "Google Drive not connected",
      });
    }
    const folderId = await getOrCreateFolder(
      "Bulk_Resumes",
      user.googleDrive.refreshToken
    );

    const ext = path.extname(req.file.originalname) || "";
    const rawName = application.name ? application.name.trim() : "Candidate";
    const safeName = rawName
      .replace(/[^a-z0-9]+/gi, "_")
      .replace(/^_+|_+$/g, "") || "Candidate";
    const safePhone = String(application.phone || "unknown").replace(
      /[^0-9]/g,
      ""
    );
    const driveFileName = `${safeName || "unknown"}_${safePhone}${ext}`;

    const resumeUrl = await uploadToGoogleDrive(
      req.file.path,
      driveFileName,
      user.googleDrive.refreshToken,
      folderId
    );

    application.resume = resumeUrl;
    application.resumeStorage = "GOOGLE_DRIVE";
    await application.save();

    await fs.remove(req.file.path);

    res.status(200).json({
      message: "Resume uploaded successfully",
      resumeUrl,
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.remove(req.file.path).catch(() => {});
    }
    res.status(500).json({ message: error.message });
  }
}