import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import User from './models/user.js';
import dotenv from 'dotenv';
import multer from 'multer';
import Post from './models/post.js';
import Comment from './models/comment.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'videos',
      resource_type: isVideo ? 'video' : 'image',
      public_id: Date.now().toString(),
      use_filename: true,
      unique_filename: true,
      overwrite: true
    };
  },
});
const upload = multer({ storage });

app.use(cors({ origin: ['http://localhost:5173', 'https://pulse-0o0k.onrender.com'], credentials: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

mongoose.connect(process.env.MONGODB_URI).then(() => console.log("Database connected.")).catch((err) => console.error("MongoDB connection error:", err));

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.post('/upload', upload.array('media'), async (req, res) => {
  const { userId, title, body, type } = req.body;
  let mediaUrls = [];
  if (req.files && req.files.length > 0) {
    mediaUrls = req.files.map(file => file.path);
  }
  try {
    const newPost = new Post({
      postedBy: userId,
      title,
      body,
      type,
      media: mediaUrls,
    });
    await newPost.save();
    res.status(200).json({ message: "Post created successfully." });
  } catch (err) {
    console.error("Post creation error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return res.status(400).json({ message: "Email already in use." });
    }
    const newUser = new User({ email, password });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: "User registered successfully.", token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.post('/api-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: "Login successful.", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('postedBy', 'email username profilePicture followers about');
    res.status(200).json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

app.post('/posts/:postId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.dislikes = post.dislikes.filter(id => id !== userId);
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ likes: post.likes, dislikes: post.dislikes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/posts/:postId/dislike', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.likes = post.likes.filter(id => id !== userId);
    if (post.dislikes.includes(userId)) {
      post.dislikes = post.dislikes.filter(id => id !== userId);
    } else {
      post.dislikes.push(userId);
    }
    await post.save();
    res.json({ likes: post.likes, dislikes: post.dislikes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;

  try {
    const postComments = await Post.findById(postId).select('comments').populate({
      path: "comments",
      select: "content createdAt",
      populate: {
        path: "postedBy",
        select: "email username profilePicture followers about",
      },
    });
    if (!postComments) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(postComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error while fetching comments" });
  }
});

app.post('/posts/:postId/new-comment', async (req, res) => {
  const { postId } = req.params;
  const { comment, userId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const newComment = new Comment({
      content: comment,
      postedBy: userId,
      postId: postId,
    });
    await newComment.save();
    const populatedComment = await Comment.populate(newComment, {
      path: 'postedBy',
      select: 'email username profilePicture followers about'
    });
    post.comments.push(newComment._id);
    await post.save();
    res.status(201).json({ message: "Comment added successfully.", comment: populatedComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error while adding comment" });
  }
});

app.get('/posts/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('postedBy', 'email username profilePicture followers about');
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/users/:userId/profile-picture', upload.single('profilePicture'), async (req, res) => {
  const { userId } = req.params;
  const { file } = req;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.profilePicture = file.path;
    await user.save();
    res.json({ message: "Profile picture updated successfully", profilePicture: user.profilePicture });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Server error while updating profile picture" });
  }
});

app.put('/users/:userId/username', async (req, res) => {
  const { userId } = req.params;
  const { newUsername } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.username = newUsername;
    await user.save();
    res.json({ message: "Username updated successfully", username: user.username });
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ message: "Server error while updating username" });
  }
});

app.put('/users/:userId/about', async (req, res) => {
  const { userId } = req.params;
  const { newAbout } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.about = newAbout;
    await user.save();
    res.json({ message: "About section updated successfully", about: user.about });
  } catch (error) {
    console.error("Error updating about section:", error);
    res.status(500).json({ message: "Server error while updating about section" });
  }
});

app.delete('/api/comments/:commentId', authenticate, async (req, res) => {
  const { commentId } = req.params;

  // Validate comment ID
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: "Invalid comment ID format" });
  }

  try {
    // Find and delete the comment
    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Remove comment reference from post
    await Post.findByIdAndUpdate(comment.postId, {
      $pull: { comments: commentId }
    });

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: "Server error while deleting comment",
      error: error.message
    });
  }
});

app.post('/follow', async (req, res) => {
  const { userId, userToFollowId, action } = req.body;

  try {
    // Validate users exist
    const [currentUser, userToFollow] = await Promise.all([
      User.findById(userId),
      User.findById(userToFollowId)
    ]);

    if (!currentUser || !userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine action
    const shouldFollow = action === "follow";

    // Update followers
    if (shouldFollow) {
      if (!userToFollow.followers.includes(userId)) {
        userToFollow.followers.push(userId);
      }
    } else {
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== userId
      );
    }

    await userToFollow.save();
    res.json({
      message: shouldFollow ? "Followed successfully" : "Unfollowed successfully",
      followers: userToFollow.followers
    });
  } catch (error) {
    console.error("Error updating follow status:", error);
    res.status(500).json({ message: "Server error while updating follow status" });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
