import Job from "../models/Job.js"

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
export const updateJob = async (req,res) => {
    try{
        const {id} = req.params;
        await Job.findOneAndUpdate({'jobId': id});
        res.status(200).json({message: "Job updated successfully!"});
    }
    catch(err){
        res.status(500).json({"message":err});
    }
}
