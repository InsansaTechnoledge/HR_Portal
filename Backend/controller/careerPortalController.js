import Applicant from "../models/Applicant.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplications.js";

export const applyForJob = async (req, res) => {
    try {
        const { jobId,applicantId,formDetails } = req.body;
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const jobApplication = {
            jobId:jobId,
            applicantId:applicantId,
            name:formDetails.applicantName,
            email:formDetails.applicantEmail,
            phone:formDetails.applicantPhone,
            resume:formDetails.applicantResume,
        };
        const savedJobApplication = await JobApplication.create(jobApplication);
        const applicant = await Applicant.findById(applicantId);
        applicant.applications.push(savedJobApplication._id);
        await applicant.save();
        res.status(200).json({ message: 'Job application saved successfully!', jobApplication: savedJobApplication });
    } catch (error) {
        console.error('Error saving job application:', error.message);
        res.status(500).json({ message: 'Error saving job application', error: error.message });
    }
};

export const getMyJobApplication = async (req, res) => {};

export const updateProfile = async (req, res) => {};

export const getProfile = async (req, res) => {};

export const changeStatus = async (req, res) => {};

export const createApplicant = async (req, res) => {
    try{
        const { name, email, password} = req.body;
        const applicant = {
            name,
            email,
            password,
        };
        const savedApplicant = await Applicant.create(applicant);
        console.log(savedApplicant);
        res.status(200).json({ message: 'Applicant saved successfully!', applicant: savedApplicant });
    } catch (error) {
        console.error('Error saving applicant:', error.message);
        res.status(500).json({ message: 'Error saving applicant', error: error.message });
    }
};

