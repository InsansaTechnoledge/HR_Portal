import express from 'express'
import { fetchByEmployeeId, generatePaySlip, getPayslips } from '../controller/paySlipController.js';

const router = express.Router()

router.post('/generate', generatePaySlip);
router.get('/', getPayslips);
router.get('/fetchByEmployeeId/:id', fetchByEmployeeId);

export default router