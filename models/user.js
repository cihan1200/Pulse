import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: process.env.DEFAULT_PROFILE_PICTURE
  },
  username: {
    type: String,
    default: function () {
      return `user-${this._id.toString().slice(-5)}`;
    }
  },
  about: {
    type: String,
    default: ''
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  }
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);