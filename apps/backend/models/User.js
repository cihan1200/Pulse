import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxLength: 254
    },
    password: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String,
      default: ""
    },
    bannerPicture: {
      type: String,
      default: ""
    },
    bio: {
      type: String,
      default: "No bio added for this user."
    },
    // CHANGED: Array of IDs instead of Number
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: []
    },
    // NEW: Track who the user follows
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: []
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 8,
      maxlength: 30
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);