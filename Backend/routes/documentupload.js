import express from "express";
import multer from "multer";
import {
  uploadDocument,
  deleteDocument,
  getAllDocuments,
} from "../controller/DocumentUploadController.js";

const router = express.Router();

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post("/upload", upload.single("document"), uploadDocument);
router.delete("/delete/:id", deleteDocument);
router.get("/all", getAllDocuments);

export default router;
