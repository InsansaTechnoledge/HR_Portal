import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const email = req.params?.email || "unknown";

    // sanitize email for Cloudinary folder
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "_");

    // normalize file extension (docx, doc, pdf)
    const extension = (file.originalname.split(".").pop() || "").toLowerCase();
    const baseName = file.originalname.replace(/\.[^/.]+$/, "");

    return {
      folder: `documents/${safeEmail}`,
      resource_type: "raw",
      format: extension || undefined,
      public_id: `${Date.now()}-${baseName}`.replace(/[^a-zA-Z0-9-_]/g, "_"),
    };
  },
});

const allowedExtensions = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "png",
  "jpg",
  "jpeg",
]);

const uploadDoc = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname.split(".").pop() || "").toLowerCase();
    if (!allowedExtensions.has(ext)) {
      return cb(new Error("Unsupported file type"));
    }
    return cb(null, true);
  },
});

export default uploadDoc;
