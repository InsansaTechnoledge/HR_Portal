import express from "express";
import { getCandidateApplications, updateCandidateApplicationStatus, uploadResumeController,  } from "../controller/candidateApplicationController.js";
import uploadResume from "../middleware/uploadResume.js";
import checkCookies from "../middleware/checkCookies.js";
const router = express.Router();

router.get("/", getCandidateApplications);
router.put("/:id/status", updateCandidateApplicationStatus);
router.post(
	"/:applicationId/resume",
	checkCookies,
	uploadResume.single("resume"),
	uploadResumeController
);

export default router;
