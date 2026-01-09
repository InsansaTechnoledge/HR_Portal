import mongoose from "mongoose";

const candidateApplication = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: { type: [Number], required: true, index: true },
    rawJobTitle: String,
    experience: String,
    relevantExperience: String,
    skills: [String],
    location: String,
    status: { type: String, default: "Under Review" },
    resume: { type: String, default: "BULK_UPLOAD_PENDING" },
    noticePeriod: String,
    linkedIn: String,
    source: { type: String, default: "EXCEL_UPLOAD" },
  },
  { timestamps: true }
);

candidateApplication.index({ phone: 1, email: 1 }, { unique: true });

export default mongoose.model("CandidateApplication", candidateApplication);
