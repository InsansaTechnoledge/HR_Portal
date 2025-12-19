import express from "express";
//Middleware
import uploadResume from "../middleware/uploadResume.js";

//Controller
import {uploadResumeController} from "../controller/jobApplicationController.js";

const router = express.Router();

router.post("/:applicationId/resume", uploadResume.single("resume"), uploadResumeController);

export default router;
