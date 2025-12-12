import express from 'express'
import { fetchPaySlipbyEmployeeEmail, generatePaySlip, getPayslips } from '../controller/paySlipController.js';

const router = express.Router()

router.post('/generate', generatePaySlip);
router.get('/', getPayslips);
router.get('/my-payslip/:email', fetchPaySlipbyEmployeeEmail);

export default router