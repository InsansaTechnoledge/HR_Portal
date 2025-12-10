import multer from 'multer';
import Candidate from '../models/Candidate.js';

// Configure multer storage in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const addCandidate = [
    // Multer middleware to handle file upload
    upload.single('resume'),
    async (req, res) => {
        try {
            const { name, technology, client, email, contact_no, source, linkedIn } = req.body;
            // Get the uploaded file
            const resumeBuffer = req.file?.buffer;

            if (!resumeBuffer) {
                return res.status(400).json({ message: 'Resume file is required.' });
            }
            const candidate = {
                name,
                technology,
                client,
                email,
                contact_no,
                source,
                linkedIn,
                resume: resumeBuffer, // Store resume as Buffer
            };

            const savedCandidate = await Candidate.create(candidate);
            res.status(200).json({ message: 'Candidate saved successfully!', candidate: savedCandidate });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error saving candidate', error: err.message });
        }
    },
];

export const getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.status(200).json(candidates);
    } catch (error) {
        console.error('Error fetching candidates:', error.message);
        res.status(500).json({ message: 'Error fetching candidates', error: error.message });
    }
};


