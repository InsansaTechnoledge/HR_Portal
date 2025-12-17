import express from "express";
import upload from "../middleware/upload.js";
import { uploadResume } from "../controller/jobApplicationController.js";

const router = express.Router();

router.post("/:applicationId/resume", upload.single("resume"), uploadResume);

export default router;
