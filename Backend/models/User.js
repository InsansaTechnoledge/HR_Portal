import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import mongooseSequence from 'mongoose-sequence';

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
  }
});

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
