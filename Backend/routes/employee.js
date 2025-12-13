import express from 'express';
import multer from 'multer';
import { addEmployee, addLeave, fetchEmployee, fetchEmployeeByEmail, fetchEmployeeById, updateSalary, uploadDetails } from '../controller/employeeController.js';

const router = express.Router();

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: {fileSize: 10*1024*1024} });

router.post('/add', addEmployee);
router.get('/', fetchEmployee);
router.get('/fetchEmployeeByEmail/:email', fetchEmployeeByEmail);
router.get('/:id',fetchEmployeeById);
router.post('/addLeave/:id',addLeave);
router.post('/uploadDetails', upload.fields([
    { name: "documentsPanCard", maxCount: 1 },
    { name: "documentsAadhar", maxCount: 1 },
    { name: "documentsDegree", maxCount: 1 },
    { name: "documentsExperience", maxCount: 1 },
]) , uploadDetails) ;
router.post('/updateSalary/:id', updateSalary);

export default router;