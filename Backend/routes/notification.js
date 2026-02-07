import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, deleteAllNotifications } from '../controller/notificationController.js';
import checkCookies from '../middleware/checkCookies.js';

const router = express.Router();

router.get('/', checkCookies, getNotifications);
router.put('/:id/read', checkCookies, markAsRead);
router.put('/read-all', checkCookies, markAllAsRead);
router.delete('/clear-all', checkCookies, deleteAllNotifications);

export default router;
