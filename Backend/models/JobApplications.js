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
        type:String,
        required:true,
    }
    
});

jobApplicationSchema.index({jobId:1,applicantId:1});

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;