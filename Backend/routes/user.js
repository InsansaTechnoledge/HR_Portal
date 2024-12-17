import express from 'express'
import { deleteUser, getUser, createUser } from '../controller/userController.js';

const router = express.Router();

router.get('/', getUser)
router.post('/createUser', createUser)
router.delete('/delete/:id',deleteUser)

export default router;