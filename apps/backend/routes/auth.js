import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/User.js";
import dotenv from "dotenv";
import { createAvatar } from '@dicebear/core';
import { shapes } from '@dicebear/collection';

dotenv.config();

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (email.length > 254) {
      return res.status(400).json({ message: "Email cannot exceed 254 characters" });
    }

    if (password.length < 8 || password.length > 50) {
      return res.status(400).json({ message: "Password must be between 8 and 50 characters" });
    }

    if (username.length < 8 || username.length > 20) {
      return res.status(400).json({ message: "Username must be between 8 and 20 characters" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: "Email already exists" });
      }
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      password: hashedPassword,
      username
    });

    const avatar = createAvatar(shapes, {
      seed: user._id.toString(),
    });

    user.profilePicture = avatar.toDataUri();

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        followers: user.followers
      }
    });
  } catch (err) {
    console.error("Signup Error Details:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        followers: user.followers
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { googleToken } = req.body;

    const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${googleToken}` }
    });

    const { email, name, picture } = googleRes.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const token = jwt.sign(
        { id: existingUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: {
          id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email,
          profilePicture: existingUser.profilePicture,
          bio: existingUser.bio,
          followers: existingUser.followers
        }
      });
    } else {

      // Generate a secure random password (required by your User model)
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      // Generate a valid username (Must be 8-20 chars)
      // We take the name, remove spaces, and add 4 random numbers
      const cleanName = name.replace(/\s+/g, "").slice(0, 10);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      let newUsername = `${cleanName}${randomSuffix}`.toLowerCase();

      // Ensure min length of 8 (pad with 'x' if name is very short)
      while (newUsername.length < 8) {
        newUsername += "x";
      }

      const newUser = new User({
        email,
        password: hashedPassword,
        username: newUsername,
        profilePicture: picture // Use their Google photo
      });

      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          profilePicture: newUser.profilePicture,
          bio: newUser.bio,
          followers: newUser.followers
        }
      });
    }

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
});

export default router;