import express from 'express';
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    addComment,
    updateComment,
    deleteComment,
    getTaskStats
} from '../controller/taskController.js';
import checkCookies from '../middleware/checkCookies.js';

const router = express.Router();

// All routes require authentication
 router.use(checkCookies);

// Task CRUD routes
router.post('/', createTask);
router.get('/', getAllTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Comment routes
router.post('/:id/comment', addComment);
router.put('/:id/comment/:commentIndex', updateComment);
router.delete('/:id/comment/:commentIndex', deleteComment);

export default router;
