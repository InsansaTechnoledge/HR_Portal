import dotenv from "dotenv";
dotenv.config();
import XLSX from "xlsx";
import fs from "fs-extra";
import bcrypt from "bcryptjs";
import unzipper from "unzipper";
import path from "path";
import uploadToGoogleDrive from "../utils/googleDriveUpload.js";
import Job from "../models/Job.js";
import Applicant from "../models/Applicant.js";
import JobApplication from "../models/JobApplications.js";
import User from "../models/User.js";
import getOrCreateFolder from "../utils/googleDriveFolder.js";


//Helper to recursively get all files in a directory
const getAllFiles = async (dirPath, arrayOfFiles = []) => {
  const files = await fs.readdir(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
};

export const bulkUploadJobApplications = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let successCount = 0;
    let failedRows = [];

    for (const row of rows) {
      const { name, email, phone, jobTitle } = row;

      // Basic validation
      if (!name || !email || !phone || !jobTitle) {
        failedRows.push({ row, reason: "Missing required fields" });
        continue;
      }

      // Find Job
      const job = await Job.findOne({ jobTitle });
      if (!job) {
        failedRows.push({ row, reason: "Job not found" });
        continue;
      }

      //  Find or Create Applicant
      let applicant = await Applicant.findOne({ email });

      if (!applicant) {
        const hashedPassword = await bcrypt.hash("Temp@123", 10);

        applicant = await Applicant.create({
          name,
          email,
          phone,
          password: hashedPassword,
        });
      }

      //  Prevent duplicate application
      const exists = await JobApplication.findOne({
        jobId: job._id,
        applicantId: applicant._id,
      });

      if (exists) {
        failedRows.push({
          row,
          reason: "Applicant already applied for this job",
        });
        continue;
      }

      // Create Job Application
      const application = await JobApplication.create({
        jobId: job._id,
        applicantId: applicant._id,
        name,
        email,
        phone,
        resume: "BULK_UPLOAD_PENDING",
      });

      //  Update applicant applications list
      applicant.applications.push(application._id);
      applicant.applications.push(application._id);
      await applicant.save();

      successCount++;
    }

    // Clean up uploaded file
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    res.status(200).json({
      message: "Bulk upload completed",
      successCount,
      failedCount: failedRows.length,
      failedRows,
    });
  } catch (error) {
    // Clean up on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    console.error("Bulk upload error:", error);
    res.status(500).json({
      message: "Bulk upload failed",
      error: error.message,
    });
  }
};

// Google Drive Bulk Upload
export const bulkResumeUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "ZIP file required" });
    }

    const extractPath = path.join(process.cwd(), "temp_resumes");
    await fs.ensureDir(extractPath);

    await fs
      .createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    const files = await getAllFiles(extractPath);

    let successCount = 0;
    const failed = [];

    const user = await User.findById(req.user.id).select(
      "+googleDrive.refreshToken"
    );

    if (!user?.googleDrive?.refreshToken) {
      return res.status(400).json({
        message: "Google Drive not connected",
      });
    }

    // CREATE FOLDER ONCE
    const folderId = await getOrCreateFolder(
      "Bulk_Resumes",
      user.googleDrive.refreshToken
    );

    for (const filePath of files) {
      const fileName = path.basename(filePath);
      const mobile = fileName.split(".")[0];

      if (!/^\d{10}$/.test(mobile)) {
        failed.push({ file: fileName, reason: "Invalid filename" });
        continue;
      }

      const application = await JobApplication.findOne({ phone: mobile });
      if (!application) {
        failed.push({ file: fileName, reason: "No application found" });
        continue;
      }

      const driveUrl = await uploadToGoogleDrive(
        filePath,
        fileName,
        user.googleDrive.refreshToken,
        folderId 
      );

      application.resume = driveUrl;
      application.resumeStorage = "GOOGLE_DRIVE";
      await application.save();

      successCount++;
    }

    await fs.remove(extractPath);
    await fs.remove(req.file.path);

    res.json({
      message: "Bulk resume upload completed",
      successCount,
      failed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
