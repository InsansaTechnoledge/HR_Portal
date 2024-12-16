import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  jobLocation: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  salaryRange: {
    type: String,
    required: true
  }
});

const Job = mongoose.model('Job', JobSchema);
export default Job;