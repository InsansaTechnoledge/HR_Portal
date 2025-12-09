import express from 'express'
import { deleteUser, getUser, createUser, editLoginInfo, changePassword, getUserById, addLeaveToUser } from '../controller/userController.js';

const router = express.Router();

router.get('/', getUser)
router.get('/:id', getUserById)
router.post('/createUser', createUser)
router.post('/addLeave/:id', addLeaveToUser)
router.delete('/delete/:id',deleteUser)
router.put("/edit-login-info", editLoginInfo);
router.put("/changePassword/:id", changePassword);


export default router;