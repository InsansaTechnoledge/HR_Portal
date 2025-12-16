import express from "express";
import upload from "../middleware/upload.js";

import {
  uploadDocument,
  deleteDocument,
  getAllDocuments,
  viewDocument,
  downloadDocument,
} from "../controller/DocumentUploadController.js";

const router = express.Router();

router.post("/upload", upload.single("document"), uploadDocument);
router.delete("/delete/:id", deleteDocument);
router.get("/all", getAllDocuments);
router.get('/view/:id', viewDocument)
router.get('/download/:id', downloadDocument)

export default router;
