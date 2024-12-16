import express from 'express';
import {postJob, getJobs, deleteJob, updateJob } from '../controller/jobController.js'
import Job from '../models/Job.js';

const router = express.Router();

router.post("/post", postJob);
router.get("/list", getJobs);
router.delete("/delete/:id", deleteJob);
router.put("/update/:id",updateJob)



export default router;