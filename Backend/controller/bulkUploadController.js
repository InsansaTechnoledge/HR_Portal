import XLSX from "xlsx";
import fs from "fs";
import bcrypt from "bcryptjs";
import Job from "../models/Job.js";
import Applicant from "../models/Applicant.js";
import JobApplication from "../models/JobApplications.js";

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
