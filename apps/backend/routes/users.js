import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import bcrypt from "bcryptjs";
// 1. Import Cloudinary and Storage Engine
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// --- 2. CONFIG CLOUDINARY ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 3. SETUP MULTER WITH CLOUDINARY ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "social_app_users", // The folder name in your Cloudinary dashboard
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage: storage });

// --- 4. GET USER ---
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 5. UPDATE USER ---
router.put("/:id", verifyToken,
  upload.fields([{ name: "profilePicture", maxCount: 1 }, { name: "bannerPicture", maxCount: 1 }]),
  async (req, res) => {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "You can only update your own account" });
    }

    try {
      const { username, email, bio, password } = req.body;
      const user = await User.findById(req.params.id);

      if (!user) return res.status(404).json({ message: "User not found" });

      if (username) user.username = username;
      if (email) user.email = email;
      if (bio) user.bio = bio;

      if (password) {
        user.password = await bcrypt.hash(password, 12);
      }

      // Handle Image Uploads via Cloudinary
      if (req.files) {
        if (req.files["profilePicture"]) {
          // Cloudinary provides the full URL in .path
          user.profilePicture = req.files["profilePicture"][0].path;
        }
        if (req.files["bannerPicture"]) {
          user.bannerPicture = req.files["bannerPicture"][0].path;
        }
      }

      const updatedUser = await user.save();
      const { password: _, ...userData } = updatedUser._doc;

      res.status(200).json({ ...userData, id: updatedUser._id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// --- 6. FOLLOW / UNFOLLOW USER ---
router.put("/:id/follow", verifyToken, async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(403).json({ message: "You cannot follow yourself" });
  }

  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (userToFollow.followers.includes(req.user.id)) {
      // Unfollow
      await userToFollow.updateOne({ $pull: { followers: req.user.id } });
      await currentUser.updateOne({ $pull: { following: req.params.id } });
      res.status(200).json({ message: "Unfollowed user" });
    } else {
      // Follow
      await userToFollow.updateOne({ $push: { followers: req.user.id } });
      await currentUser.updateOne({ $push: { following: req.params.id } });
      res.status(200).json({ message: "Followed user" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 7. DELETE USER ---
router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ message: "You can only delete your own account" });
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    await Post.deleteMany({ postedBy: req.params.id });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;