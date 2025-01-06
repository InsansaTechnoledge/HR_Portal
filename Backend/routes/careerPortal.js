import express from 'express';
import  { applyForJob,getMyJobApplication,updateProfile,getProfile,createApplicant} from '../controller/careerPortalController.js'

const router = express.Router();

router.post('/apply',applyForJob );
router.post('/sign-in',createApplicant );
router.get('/profile/:applicantId',getProfile );
router.put('/profile',updateProfile );

export default router;