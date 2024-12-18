import express from 'express';
import { login , checkSession, logout } from '../controller/authController.js'

const router = express.Router();

router.post('/login', login);
router.get('/checkSession',checkSession);
router.get('/logout', logout);
router.get('/checkCookies');



export default router;
