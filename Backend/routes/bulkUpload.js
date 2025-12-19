import express from "express";
import upload from "../config/multer.js";
import uploadZip from "../middleware/uploadZip.js";
import { bulkUploadJobApplications, bulkResumeUpload } from "../controller/bulkUploadController.js";
import { getOneDriveToken } from "../middleware/oneDriveAuth.js";

const router = express.Router();

router.post("/applications", upload.single("file"), bulkUploadJobApplications);
router.post("/resumes",uploadZip.single("zip"),getOneDriveToken,bulkResumeUpload)

export default router;
