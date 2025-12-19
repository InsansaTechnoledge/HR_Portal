import JobApplication from "../models/JobApplications.js";
import Applicant from "../models/Applicant.js";


export const uploadResumeController = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Cloudinary URL already available
    const resumeUrl = req.file.path;

    // Update JobApplication
    application.resume = resumeUrl;
    await application.save();

    await Applicant.findByIdAndUpdate(application.applicantId, {
      resume: resumeUrl,
    });

    res.status(200).json({
      message: "Resume uploaded successfully",
      resumeUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

