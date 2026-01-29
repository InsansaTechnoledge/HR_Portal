import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const sanitizeName = (name) =>
  String(name || "unknown").toLowerCase().replace(/\s+/g, "_");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const employeeName = sanitizeName(
      req.user?.userName || req.user?.userEmail || req.user?._id
    );

    return {
      folder: `expenses/${employeeName}`,
      resource_type: "auto",
      public_id: `${employeeName}_${Date.now()}_${file.originalname
        .split(".")[0]
        .replace(/\s+/g, "_")}`
    };
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only images (JPG, PNG) and PDF files are allowed"),
        false
      );
    }
    cb(null, true);
  }
});


export const uploadExpenseReceipts = (req, res, next) => {
  upload.array("receipts", 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Attach uploaded file URLs
    if (req.files && req.files.length > 0) {
      req.uploadedReceipts = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename
      }));
    }

    next();
  });
};
