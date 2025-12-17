import express from "express";
import upload from "../config/multer.js";
import { bulkUploadJobApplications } from "../controller/bulkUploadController.js";

const router = express.Router();

router.post("/applications", upload.single("file"), bulkUploadJobApplications);

export default router;
