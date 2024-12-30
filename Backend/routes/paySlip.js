import express from 'express'
import { generatePaySlip } from '../controller/paySlipController.js';

const router = express.Router()

router.post('/generate', generatePaySlip);

export default router