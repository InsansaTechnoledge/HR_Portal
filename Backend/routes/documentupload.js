import express from "express";
import {
  uploadDocument,
  deleteDocument,
  getAllDocuments,
  viewDocument,
  downloadDocument,
} from "../controller/DocumentUploadController.js";
import uploadDoc from "../middleware/uploadDocument.js";

const router = express.Router();

router.post("/upload/:email", uploadDoc.single("document"), uploadDocument);
router.delete("/delete/:id", deleteDocument);
router.get("/all", getAllDocuments);
router.get('/view/:id', viewDocument)
router.get('/download/:id', downloadDocument)

export default router;
