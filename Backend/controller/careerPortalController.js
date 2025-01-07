import Applicant from "../models/Applicant.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplications.js";

export const applyForJob = async (req, res) => {
    try {
        const formDetails = req.body;
        const job = await Job.findById(formDetails.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }


        const jobApplication = {
            jobId:formDetails.jobId,
            applicantId:formDetails.applicantId,
            name:formDetails.applicantName,
            email:formDetails.applicantEmail,
            phone:formDetails.applicantPhone,
            resume:req.file.buffer,
        };
        const savedJobApplication = await JobApplication.create(jobApplication);
        const applicant = await Applicant.findById(formDetails.applicantId);
        applicant.applications.push(savedJobApplication._id);
        await applicant.save();
        res.status(200).json({ message: 'Job application saved successfully!', jobApplication: savedJobApplication });
    } catch (error) {
        console.error('Error saving job application:', error.message);
        res.status(500).json({ message: 'Error saving job application', error: error.message });
    }
};

export const getMyJobApplications = async (req, res) => {
    try {
        const { applicantId } = req.params;

        // Step 1: Fetch the applicant by ID
        const applicant = await Applicant.findById(applicantId);
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        // Step 2: Use aggregation to fetch job applications and their respective job data
        const applicationsWithJobs = await JobApplication.aggregate([
            {
                $match: { _id: { $in: applicant.applications } }, // Match job applications for the applicant
            },
            {
                $lookup: {
                    from: 'jobs', // The name of the collection containing job data
                    localField: 'jobId', // Field in JobApplication that references Job
                    foreignField: '_id', // Field in Job that matches JobApplication.jobId
                    as: 'job', // The name of the array field to store the joined data
                },
            },
            {
                $unwind: '$job', // Optional: Flatten the 'job' array if there's only one job per application
            },
            {
                $project: {
                    _id: 1, // Include job application ID
                    status: 1, // Include status field from JobApplication
                    applicationData:1,
                    jobId: 1,
                    // Include jobId field from JobApplication
                    'job.jobTitle': 1, // Include job title from Job
                    'job.jobLocation': 1, // Include job location from Job
                    'job.skills':1,
                    'job.salaryRange':1,
                },
            },
        ]);

        // Step 3: Send the result
        res.status(201).json({ applicationsWithJobs });
    } catch (error) {
        console.error('Error fetching job applications:', error.message);
        res.status(500).json({ message: 'Error fetching job applications', error: error.message });
    }
};


export const updateProfile = async (req, res) => {
    const formDetails=req.body;   
    const applicantId = formDetails.applicantId;

    const data = {
        name: formDetails.name,
        phone: formDetails.phone,
        email: formDetails.email,
        resume: req.file.buffer
    }

    const savedApplicant = await Applicant.findByIdAndUpdate(applicantId
        ,data
        ,{new:true}
    );
    console.log(savedApplicant);
    res.status(201).json({ message: 'Applicant updated successfully!', applicant: savedApplicant });

};

export const getProfile = async (req, res) => {
    try{
        const { applicantId } = req.params;
        const applicant = await Applicant.findById(applicantId);
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
        const data={
            name:applicant.name,
            email:applicant.email,
            phone:applicant.phone,
            resume:applicant.resume,
            applications: applicant.applications
        }
        res.status(201).json({data});
    }catch(error){
        console.error('Error fetching applicant:', error.message);
        res.status(500).json({ message: 'Error fetching applicant', error: error.message }); 
    };
};

export const changeStatus = async (req, res) => {
    const {jobApplicationId,status}=req.body;   
    const savedJobApplication = await JobApplication.findByIdAndUpdate(
        jobApplicationId,
        {$set:{status:status}},
        {new:true});
    console.log(savedJobApplication);
    res.status(201).json({ message: 'Status updated successfully!', jobApplication: savedJobApplication });

};

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

