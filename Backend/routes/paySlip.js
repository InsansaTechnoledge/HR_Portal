import express from 'express'
import { deletePaySlipById, fetchPaySlipbyEmployeeEmail, fetchPaySlipById, generatePaySlip, getPayslips } from '../controller/paySlipController.js';

const router = express.Router()
router.post('/generate', generatePaySlip);
router.get('/', getPayslips);
router.get('/my-payslip/:email', fetchPaySlipbyEmployeeEmail);  // fetch payslip by employee email
router.get('/:id', fetchPaySlipById);     // download payslip by id
router.delete("/delete/:id",deletePaySlipById)

export default router