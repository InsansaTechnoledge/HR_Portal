import express from 'express'
import { deleteUser, getUser, signup } from '../controller/userController.js';

const router = express.Router();

router.get('/', getUser)
router.post('/signup', signup)
router.delete('/delete/:id',deleteUser)

export default router;