import express from "express";
import Post from "../models/Post.js";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* ======================================================
   MULTER CONFIG (file uploads)
====================================================== */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

/* ======================================================
   HELPERS
====================================================== */

// Fetch a post with populated fields (single source of truth)
const getPopulatedPostById = (postId) =>
  Post.findById(postId)
    .populate("postedBy", "username profilePicture bio followers")
    .populate("comments.userId", "username profilePicture");

/* ======================================================
   ROUTES
====================================================== */

/**
 * CREATE POST
 * Creates a new post (text, image(s), or video)
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
      // NEW: Extract category from req.body
      const { title, body, type, category } = req.body;
      let content = [];

      if (type === "text") {
        content = [body];
      } else if (req.files?.images) {
        content = req.files.images.map(
          (file) => `/uploads/${file.filename}`
        );
      } else if (req.files?.video) {
        content = [`/uploads/${req.files.video[0].filename}`];
      }

      const newPost = new Post({
        postedBy: req.user.id,
        postTitle: title,
        postType: type,
        // NEW: Save the category
        category: category || "General",
        description: body || "No description added for this post.",
        postContent: content
      });

      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * GET POSTS
 * Fetches posts (optionally filtered by userId OR search term) with pagination
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

    // NEW: Category Filter
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
 * Returns all comments made by a specific user
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
 * Fetches one post by ID including comments
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
 * Adds a comment to a post
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
 * Updates an existing comment owned by the user
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
 * Deletes a comment owned by the user
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

    // NEW: Update the count
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

    // NEW: Update the count (because likes might have decreased)
    post.likesCount = post.likes.length;

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET LIKED POSTS
 * Returns posts liked by a specific user
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
