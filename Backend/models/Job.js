import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

const JobSchema = new mongoose.Schema({
  jobId: {
    type: Number,
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

JobSchema.plugin(mongooseSequence(mongoose), { inc_field: 'jobId' });

const Job = mongoose.model('Job', JobSchema);
export default Job;