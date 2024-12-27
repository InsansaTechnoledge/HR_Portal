import express from 'express';
import multer from 'multer';
import { addEmployee, addLeave, fetchEmployee, fetchEmployeeById, uploadDetails } from '../controller/employeeController.js';

const router = express.Router();

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: {fileSize: 10*1024*1024} });

router.post('/add', addEmployee);
router.get('/', fetchEmployee);
router.get('/:id',fetchEmployeeById)
router.post('/addLeave/:id',addLeave);
router.post('/uploadDetails', upload.fields([
    { name: "documentsPanCard", maxCount: 1 },
    { name: "documentsAadhar", maxCount: 1 },
    { name: "documentsDegree", maxCount: 1 },
    { name: "documentsExperience", maxCount: 1 },
]) , uploadDetails) ;

export default router;