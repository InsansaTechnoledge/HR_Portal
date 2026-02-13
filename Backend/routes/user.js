import express from 'express'
import { deleteUser, getUser, createUser, editLoginInfo, changePassword, getUserById, addLeaveToUser, updateUserProfile, getAllUsers, upsertUser } from '../controller/userController.js';
import checkCookies from '../middleware/checkCookies.js';
const router = express.Router();

router.get('/', getUser)
router.get('/all-users', getAllUsers)
router.get('/:id', getUserById)
router.post('/createUser', createUser)
router.post('/upsertUser', upsertUser)
router.post('/addLeave/:id', addLeaveToUser)
router.delete('/delete/:id', deleteUser)
router.put("/edit-login-info/:id", checkCookies, editLoginInfo);
router.put("/changePassword/:id", checkCookies, changePassword);
router.get("/profile/:id", getUserById);
router.put("/profile/:id", updateUserProfile);


export default router;
