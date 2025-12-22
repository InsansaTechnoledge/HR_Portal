
// middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let email = "unknown";
    let phone = "unknown"
    if (req.body?.newEmployee) {
      try {
        const details = JSON.parse(req.body.newEmployee);
        phone = details.phone || "unknown";
        email = details.email || "unknown";
      } catch (err) {
        console.error("Failed to parse newEmployee JSON");
      }
    }

    // sanitize email for folder usage
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "_");

    return {
      folder: `employees/${phone}_${safeEmail}`,
      resource_type: "raw",
      public_id: `${email}_${file.fieldname}`,
      allowed_formats: ["pdf", "png", "jpg", "jpeg"],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default upload;

