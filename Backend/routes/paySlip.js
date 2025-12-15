import express from 'express'
import { fetchPaySlipbyEmployeeEmail, fetchPaySlipById, generatePaySlip, getPayslips } from '../controller/paySlipController.js';

const router = express.Router()
router.post('/generate', generatePaySlip);
router.get('/', getPayslips);
router.get('/my-payslip/:email', fetchPaySlipbyEmployeeEmail);
router.get('/:id', fetchPaySlipById);

export default router