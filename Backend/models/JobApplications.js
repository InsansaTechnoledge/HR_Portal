import mongoose from "mongoose";
const jobApplicationSchema = new mongoose.Schema({
    jobId:{
        type:mongoose.Schema.Types.ObjectId,
        ref :"Job",
    },

    applicantId:{
        type:mongoose.Schema.Types.ObjectId,
        ref :"Applicant",
    },

    name:{
        type:String,
        required:true,
    },

    email:{
        type:String,
        required:true,
    },
    
    phone:{
        type:Number,
        required:true,
    },

    applicationDate:{
        type:Date,
        default:Date.now,
    },

    status:{
        type:String,
        default:"Under Review",
    },

    resume:{
        type:Buffer,
        required:true,
    }
    

});

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;