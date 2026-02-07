import express from 'express';
import { updateLeaveStatus } from '../controller/leaveController.js';
import checkCookies from '../middleware/checkCookies.js';

const router = express.Router();

// Update Leave Status (Admin/SuperAdmin only)
router.put('/status', checkCookies, updateLeaveStatus);

export default router;
