import express from 'express';
import multer from "multer";

import  { applyForJob,updateProfile,getApplicantDetails,createApplicant, changeStatus,getMyJobApplications} from '../controller/careerPortalController.js'

const router = express.Router();

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/apply',upload.single('applicantResume'), applyForJob );
router.post('/sign-in',createApplicant );
router.get('/profile/:applicantId',getApplicantDetails );
router.put('/profile',upload.single('resume') ,updateProfile );
router.put('/updateStatus',changeStatus);
router.get('/applications/:applicantId',getMyJobApplications);

export default router;