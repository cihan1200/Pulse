import express from "express";
import Post from "../models/Post.js";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
// 1. Import Cloudinary
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// 2. CONFIG CLOUDINARY
// (Render already has these env vars from your previous step)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ======================================================
   3. SETUP MULTER WITH CLOUDINARY
====================================================== */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "social_app_posts", // Folder name in Cloudinary
      // 'auto' lets Cloudinary detect if it's a video or image
      resource_type: "auto",
      allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "mov", "avi"],
    };
  },
});

const upload = multer({ storage });

/* ======================================================
   HELPERS
====================================================== */
const getPopulatedPostById = (postId) =>
  Post.findById(postId)
    .populate("postedBy", "username profilePicture bio followers")
    .populate("comments.userId", "username profilePicture");

/* ======================================================
   ROUTES
====================================================== */

/**
 * CREATE POST
 */
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, body, type, category } = req.body;
      let content = [];

      // 4. Update Logic to use Cloudinary URLs (file.path)
      if (type === "text") {
        content = [body];
      } else if (req.files?.images) {
        // Map over the files and get the Cloudinary URL
        content = req.files.images.map((file) => file.path);
      } else if (req.files?.video) {
        // Get the Cloudinary URL for the video
        content = [req.files.video[0].path];
      }

      const newPost = new Post({
        postedBy: req.user.id,
        postTitle: title,
        postType: type,
        category: category || "General",
        description: body || "No description added for this post.",
        postContent: content
      });

      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * GET POSTS
 */
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.userId) {
      query.postedBy = req.query.userId;
    }

    if (req.query.category && req.query.category !== "All") {
      query.category = req.query.category;
    }

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: "i" };
      query.$or = [
        { postTitle: searchRegex },
        { description: searchRegex }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (req.query.sort === 'popular') {
      sortOptions = { likesCount: -1, createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate("postedBy", "email username profilePicture bio followers")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET USER COMMENTS
 */
router.get("/comments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ "comments.userId": userId })
      .populate("postedBy", "username profilePicture")
      .select("postTitle _id comments postedBy createdAt");

    const userComments = [];

    posts.forEach((post) => {
      post.comments.forEach((comment) => {
        if (comment.userId.toString() === userId) {
          userComments.push({
            ...comment.toObject(),
            postTitle: post.postTitle,
            postId: post._id,
            postOwner: post.postedBy
          });
        }
      });
    });

    userComments.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json(userComments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET SINGLE POST
 */
router.get("/:id", async (req, res) => {
  try {
    const post = await getPopulatedPostById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ADD COMMENT
 */
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment cannot be empty" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      userId: req.user.id,
      text,
      createdAt: new Date()
    });

    post.commentsCount = post.comments.length;
    await post.save();

    const updatedPost = await getPopulatedPostById(req.params.id);
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * EDIT COMMENT
 */
router.put("/:postId/comment/:commentId", verifyToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: "Comment cannot be empty" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.text = text;
    comment.updatedAt = new Date();
    await post.save();

    const updatedPost = await getPopulatedPostById(postId);
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE COMMENT
 */
router.delete("/:postId/comment/:commentId", verifyToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.comments.pull(commentId);
    post.commentsCount = post.comments.length;
    await post.save();

    const updatedPost = await getPopulatedPostById(postId);
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * LIKE POST
 */
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;

    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
      post.dislikes.pull(userId);
    }

    post.likesCount = post.likes.length;

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DISLIKE POST
 */
router.put("/:id/dislike", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;

    if (post.dislikes.includes(userId)) {
      post.dislikes.pull(userId);
    } else {
      post.dislikes.push(userId);
      post.likes.pull(userId);
    }

    post.likesCount = post.likes.length;

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET LIKED POSTS
 */
router.get("/likedBy/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ likes: req.params.userId })
      .populate("postedBy", "email username profilePicture bio followers")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;