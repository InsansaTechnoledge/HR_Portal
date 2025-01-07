import express from 'express';
import multer from "multer";

import  { applyForJob,getMyJobApplication,updateProfile,getProfile,createApplicant} from '../controller/careerPortalController.js'

const router = express.Router();

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/apply',upload.single('applicantResume'), applyForJob );
router.post('/sign-in',createApplicant );
router.get('/profile/:applicantId',getProfile );
router.put('/profile',upload.single('resume') ,updateProfile );

export default router;