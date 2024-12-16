import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const AutoIncrement = mongooseSequence(mongoose);

const candidateSchema = new mongoose.Schema({
    candidateId: {
        type: Number,
        unique: true, 
    },
    name: {
        type: String,
        required: true,
    },
    technology: {
        type: String,
        required: true,
    },
    client: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    contact_no: {
        type: String,
        required: true,
    },
    linkedIn: {
        type: String,
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
    resume: {
        type: Buffer,
        required: true,
    },
});

// Add the mongoose-sequence plugin for auto-incrementing candidateId
candidateSchema.plugin(AutoIncrement, { inc_field: "candidateId" });

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;
