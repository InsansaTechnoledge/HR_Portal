import express from "express";
import upload from "../config/multer.js";
import { zipUpload } from "../middleware/uploadZip.js";
import checkCookies from "../middleware/checkCookies.js";
import {
  bulkUploadJobApplications,
  bulkResumeUpload,
} from "../controller/bulkUploadController.js";

const router = express.Router();

router.post(
  "/applications",
  checkCookies,
  upload.single("file"),
  bulkUploadJobApplications
);
router.post(
  "/resumes",
  checkCookies,
  zipUpload.single("zip"),
  bulkResumeUpload
);

export default router;
