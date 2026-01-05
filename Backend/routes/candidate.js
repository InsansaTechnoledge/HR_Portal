import express from 'express'
import { addCandidate , getAllCandidates, getCandidateByEmail } from '../controller/candidateController.js'

const router = express.Router()

router.post('/add', addCandidate);
router.get('/candidates', getAllCandidates);
router.get("/:email", getCandidateByEmail);

export default router