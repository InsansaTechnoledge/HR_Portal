import express from 'express'
import { addCandidate } from '../controller/candidateController.js'

const router = express.Router()

router.post('/add', addCandidate)

export default router