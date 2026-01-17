import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postTitle: {
      type: String,
      required: true,
    },
    // NEW: Category Field
    category: {
      type: String,
      required: true,
      default: "General",
      enum: ["General", "Technology", "Lifestyle", "Gaming", "Art", "Music", "Science", "Sports"]
    },
    postType: {
      type: String,
      enum: ["text", "image", "video"],
      required: true,
    },
    postContent: {
      type: [String],
      validate: {
        validator: function (val) {
          if (this.postType === "video" && val.length !== 1) return false;
          if (this.postType === "image" && val.length < 1) return false;
          return true;
        },
        message: "Video requires exactly 1 link; Images require at least 1.",
      },
    },
    description: {
      type: String,
      default: "",
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date }
      }
    ],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

export default Post;