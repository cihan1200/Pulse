import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  isFirstPost: {
    type: Boolean,
    default: false,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  media: [{
    type: String,
    default: null,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  title: {
    type: String,
    required: true,
  },
  likes: [{
    type: String,
    default: null,
  }],
  dislikes: [{
    type: String,
    default: null,
  }],
  type: {
    type: String,
    default: "text",
  },
  body: {
    type: String,
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
});

PostSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count === 0) {
      this.isFirstPost = true;
    }
  }
  next();
});

export default mongoose.model('Post', PostSchema);