import express from 'express';
import {postJob, getJobs, deleteJob, updateJob, getJobApplications, updateApplicationStatus } from '../controller/jobController.js'

const router = express.Router();

router.post("/post", postJob);
router.get("/list", getJobs); 
router.delete("/delete/:id", deleteJob);
router.put("/update/:id",updateJob)
router.get("/applications",getJobApplications)
router.put("/application/status/:id", updateApplicationStatus)

export default router;