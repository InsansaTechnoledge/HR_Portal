import express from 'express'
import { deleteUser, getUser, signup, editLoginInfo } from '../controller/userController.js';

const router = express.Router();

router.get('/', getUser)
router.post('/signup', signup)
router.delete('/delete/:id',deleteUser)
router.put("/edit-login-info", editLoginInfo);


export default router;