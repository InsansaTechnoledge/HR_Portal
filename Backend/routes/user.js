import express from 'express'
import { deleteUser, getUser,createUser, editLoginInfo, changePassword } from '../controller/userController.js';

const router = express.Router();

router.get('/', getUser)
router.post('/createUser', createUser)
router.delete('/delete/:id',deleteUser)
router.put("/edit-login-info", editLoginInfo);
router.put("/changePassword/:id", changePassword);


export default router;