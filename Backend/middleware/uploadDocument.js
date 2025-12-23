import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {

    const email = req.params?.email || "unknown";

    // sanitize email for Cloudinary folder
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "_");

    return {
      folder: `documents/${safeEmail}`,   
      resource_type: "raw",
      allowed_formats: ["pdf", "png", "jpg", "jpeg", "doc", "docx"],
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const uploadDoc = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default uploadDoc;
