import express from 'express';
import { login , checkSession, logout, getUser } from '../controller/authController.js'
import checkCookies from '../middleware/checkCookies.js';

const router = express.Router();

router.post('/login', login);
router.get('/checkSession',checkSession);
router.post('/logout', logout);
router.get('/checkCookies',checkCookies, getUser);



export default router;
