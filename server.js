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

dotenv.config();

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Database connected."))
  .catch((err) => console.error("MongoDB connection error:", err));

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

app.listen(port, () => console.log(`Server is running on port ${port}`));
