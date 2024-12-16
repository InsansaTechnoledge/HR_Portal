import express from 'express'
import { addCandidate , getAllCandidates } from '../controller/candidateController.js'

const router = express.Router()

router.post('/add', addCandidate);
router.get('/candidates', getAllCandidates);


export default router