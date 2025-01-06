import express from 'express';
import  { applyForJob,getMyJobApplication,updateProfile,getProfile,createApplicant} from '../controller/careerPortalController.js'

const router = express.Router();

router.post('/apply',applyForJob );
router.post('/sign-in',createApplicant );

export default router;