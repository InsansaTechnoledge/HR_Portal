import Job from "../models/Job.js"
import JobApplication from "../models/JobApplications.js"


//post job  
export const postJob = async (req,res) => {

    try{

        const job = req.body;
      
        const savedJob = await Job.create(job)
        
        res.status(200).json({'message': 'Job saved successfully!', 'job': savedJob});
    }
    catch(err){
        console.error(err)
        res.status(500).json({
            message: 'Failed to post job',
            error: err.message,
          });
    }
}

//get jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json({
      message: "Jobs fetched successfully!",
      jobs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch jobs",
      error: err.message,
    });
  }
};

//delete job
export const deleteJob = async (req, res) => {
  try {
    const {id} = req.params;
    await Job.findOneAndDelete({'jobId': id});
    res.status(200).json({ message: "Job deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete job", error: err.message });
  }
};

//update job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; 
    const updatedJob = await Job.findOneAndUpdate(
      { jobId: id },
      updates,
      { new: true } 
    );
    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job updated successfully!", job: updatedJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update job", error: err.message });
  }
};

//get job application
export const getJobApplications= async (req, res) => {
  const JobApplications= await JobApplication.find();
  // console.log(JobApplications);
  
  res.status(201).json({message:"application fetched successfully",JobApplications: JobApplications});

}

//update job application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ 
      message: "Application status updated successfully!", 
      application: updatedApplication 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update application status", error: err.message });
  }
}

export const fetchApplicationsByApplicantId = async (req, res) => {
  try{
    const { applicantId } = req.params;
    const applications = await JobApplication.findById({ applicantId: applicantId });
    return res.status(200).json("Applications fetched successfully", applications);

  }
  catch(err){
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applications", error: err.message });
  }
}

