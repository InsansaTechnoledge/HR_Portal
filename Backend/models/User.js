import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import mongooseSequence from 'mongoose-sequence';
import LeaveSchema from './Leave.js';

const UserSchema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true
  },

  // Google Drive integration details
   googleDrive: {
    refreshToken: {
      type: String,
      select: false 
    },
    email: {
      type: String
    },
    connectedAt: {
      type: Date
    }
  },
  leaveHistory: [LeaveSchema]
});

// Useful indexes for lookup and filters
UserSchema.index({ userEmail: 1 }, { unique: true });
UserSchema.index({ role: 1 });

// Hash the password before saving it
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.plugin(mongooseSequence(mongoose), { inc_field: 'userId' });

const User = mongoose.model('User', UserSchema);

export default User;
