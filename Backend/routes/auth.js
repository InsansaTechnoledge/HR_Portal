import express from 'express';

import { login , signup , checkSession, logout } from '../controller/authController.js'


const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/checkSession',checkSession);
router.get('/logout', logout);

export default router;
