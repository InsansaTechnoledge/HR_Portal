import JobApplication from "../models/JobApplications.js";
import Applicant from "../models/Applicant.js";
import cloudinary from "../config/cloudinary.js";

export const uploadResume = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "resumes",
      resource_type: "raw",
    });

    // Update JobApplication
    application.resume = result.secure_url;
    await application.save();

    // (Optional) Update Applicant resume
    await Applicant.findByIdAndUpdate(application.applicantId, {
      resume: result.secure_url,
    });

    res.json({
      message: "Resume uploaded successfully",
      resumeUrl: result.secure_url,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
