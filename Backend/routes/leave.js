import express from 'express';
import { updateLeaveStatus, updateLeave, deleteLeave } from '../controller/leaveController.js';
import checkCookies from '../middleware/checkCookies.js';

const router = express.Router();

// Update Leave Status (Admin/SuperAdmin only)
router.put('/status', checkCookies, updateLeaveStatus);

// Edit/Delete Leave (Self-service, only for Pending status)
router.put('/:personId/:leaveId', checkCookies, updateLeave);
router.delete('/:personId/:leaveId', checkCookies, deleteLeave);

export default router;
