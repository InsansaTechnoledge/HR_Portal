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
import CandidateApplication from "../models/candidateApplication.js";

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

// Excel Bulk Upload
export const bulkUploadJobApplications = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file required" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let inserted = 0;
    const failedRows = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const contactCell = String(row["Contact No"] || "");

      // extract 10–12 digit numbers → convert to Number
      const phones = (contactCell.match(/\d{10,12}/g) || []).map((n) =>
        Number(n)
      );

      // remove duplicates inside same cell
      const uniquePhones = [...new Set(phones)];

      if (!uniquePhones.length) {
        failedRows.push({
          rowNumber: i + 2,
          name: row["Candidate Name"] || "",
          email: row["E-mail ID"] || "",
          phone: row["Contact No"] || "",
          experience: row["Total Exp"] || "",
          relevantExperience: row["Relevant Exp"] || "",
          skills: row["Skill Set"] || "",
          location: row["Location"] || "",
          noticePeriod: row["Notice Period /Availability"] || "",
          linkedIn: row["LinkedIn"] || "",
          reason: "Invalid phone number",
        });
        continue;
      }

      const email = row["E-mail ID"]?.toLowerCase() || "";

      const existingCandidate = await CandidateApplication.findOne({
        $or: [{ email }, { phone: { $in: uniquePhones } }],
      });

      if (existingCandidate) {
        failedRows.push({
          rowNumber: i + 2,
          name: row["Candidate Name"] || "",
          email: row["E-mail ID"] || "",
          phone: row["Contact No"] || "",
          experience: row["Total Exp"] || "",
          relevantExperience: row["Relevant Exp"] || "",
          skills: row["Skill Set"] || "",
          location: row["Location"] || "",
          noticePeriod: row["Notice Period /Availability"] || "",
          linkedIn: row["LinkedIn"] || "",
          reason: "Duplicate record (email or phone already exists)",
        });
        continue;
      }

      await CandidateApplication.create({
        name: row["Candidate Name"] || "",
        email,
        phone: uniquePhones,
        rawJobTitle: null,
        experience: row["Total Exp"] || "",
        relevantExperience: row["Relevant Exp"] || "",
        skills: row["Skill Set"]
          ? row["Skill Set"].split(",").map((s) => s.trim())
          : [],
        location: row["Location"] || "",
        noticePeriod: row["Notice Period /Availability"] || "",
        linkedIn: row["LinkedIn"] || "",
        source: "EXCEL_UPLOAD",
      });

      inserted++;
    }

    res.status(200).json({
      message: "Bulk upload completed",
      inserted,
      failedCount: failedRows.length,
      failedRows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
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
      const mobileStr = fileName.split(".")[0];

      if (!/^\d{10}$/.test(mobileStr)) {
        failed.push({ file: fileName, reason: "Invalid filename" });
        continue;
      }

      const mobile = Number(mobileStr);

      const application = await CandidateApplication.findOne({
        phone: mobile,
      });

      if (!application) {
        failed.push({ file: fileName, reason: "No matching application" });
        continue;
      }

      try {
        const ext = path.extname(fileName) || "";
        const rawName = application.name ? application.name.trim() : "Unknown";
        const safeName =
          rawName.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") ||
          "Candidate";
        const driveFileName = `${safeName}_${mobile}${ext}`;

        const driveUrl = await uploadToGoogleDrive(
          filePath,
          driveFileName,
          user.googleDrive.refreshToken,
          folderId
        );

        application.resume = driveUrl;
        application.resumeStorage = "GOOGLE_DRIVE";
        await application.save();

        successCount++;
      } catch (uploadError) {
        console.error(`Error uploading ${fileName}:`, uploadError.message);
        failed.push({
          file: fileName,
          reason: `Upload error: ${uploadError.message}`,
        });
      }
    }

    await fs.remove(extractPath);
    await fs.remove(req.file.path);

    res.json({
      message: "Bulk resume upload completed",
      successCount,
      failed,
    });
  } catch (err) {
    console.error(" Bulk upload error:", err);
    res.status(500).json({ message: err.message });
  }
};
