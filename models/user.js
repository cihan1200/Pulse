import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
    default: 'http://localhost:3000/user-icon.svg'
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

export default mongoose.model('User', userSchema);