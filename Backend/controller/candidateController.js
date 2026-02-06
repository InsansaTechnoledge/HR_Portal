import multer from 'multer';
import Candidate from '../models/Candidate.js';

// Configure multer storage in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });
export const addCandidate = [
  upload.single("resume"),
  async (req, res) => {
    try {
      const {
        name,
        technology,
        client,
        email,
        contact_no,
        source,
        linkedIn,
      } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "Resume file is required." });
      }

      const existingCandidate = await Candidate.findOne({ email });

      if (existingCandidate) {
        return res.status(409).json({
          message: "Candidate already registered",
        });
      }

      const candidate = await Candidate.create({
        name,
        technology,
        client,
        email,
        contact_no,
        source,
        linkedIn,
        resume: req.file.buffer, //RAW BUFFER
      });

      return res.status(201).json({
        message: "Candidate saved successfully!",
        candidateId: candidate._id,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Error saving candidate",
        error: err.message,
      });
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

export const getCandidateByEmail = async (req, res) => {
    try {
        const {email} = req.params;
        const candidate = await Candidate.findOne({email: email});

        res.status(200).json(candidate);
    } catch (error) {
        console.error("Error Fetching candidate Details");
        res.status(500).json({ message: 'Error fetching candidate', error: error.message });
    }
}


