import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import JobApplication from "../models/JobApplications.js";

const sanitize = (value = "") =>
  value.replace(/[^a-zA-Z0-9-_]/g, "_");

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const { applicationId } = req.params;
    console.log("Application ID:", applicationId);

    const application = await JobApplication.findById(applicationId)
      .populate("jobId", "jobId")
      .lean();

    if (!application) {
      throw new Error("Application not found");
    }

    const isPDF = file.mimetype === "application/pdf";

    const safeName = sanitize(application.name);
    const safeEmail = sanitize(application.email);
    const jobFolder = `job_${application.jobId.jobId}`;

    return {
      folder: `job_portal/resumes/${jobFolder}`,
      resource_type: isPDF ? "image" : "raw",
      format: isPDF ? "pdf" : undefined,
      public_id: `${safeName}_${safeEmail}_${applicationId}`,
      access_mode: "public",
    };
  },
});

export const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default uploadResume;
