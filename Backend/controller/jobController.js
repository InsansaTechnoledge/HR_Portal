import Job from "../models/Job.js"

export const postJob = async (req,res) => {

    try{

        const job = req.body.Job;
        
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

