import express from 'express'
import { deleteUser, signup } from '../controller/userController';

const router = express.Router();

router.get('/')
router.post('/signup', signup)
router.delete('/delete/:id',deleteUser)