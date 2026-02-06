import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
    },
    resume: {
        type: String,
    },
    applications:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref :"JobApplication",
        }
    ],
    gender: {
        type: String,
        enum:['Male','Female','Other']
    },
    linkedIn: {
        type: String,
    },
    github: {
        type: String,
    }

});

applicantSchema.index({email:1},{unique:true});

const Applicant = mongoose.model("Applicant", applicantSchema);
export default Applicant;