import express from 'express';
import { addEmployee, addLeave, fetchEmployee, fetchEmployeeById } from '../controller/employeeController.js';

const router = express.Router();

router.post('/add', addEmployee);
router.get('/', fetchEmployee);
router.get('/:id',fetchEmployeeById)
router.post('/addLeave/:id',addLeave);

export default router;