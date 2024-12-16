import express from 'express';
import {postJob} from '../controller/jobController.js'
import Job from '../models/Job.js';

const router = express.Router();

router.post("/post", postJob);

export default Job;