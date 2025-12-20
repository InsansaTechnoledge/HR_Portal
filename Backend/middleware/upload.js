// middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "employees/documents",
    resource_type: "raw", // IMPORTANT for PDFs
    allowed_formats: ["pdf", "png", "jpg", "jpeg"],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});


const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB limit

export default upload;
