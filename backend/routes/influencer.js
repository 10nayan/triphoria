import express from 'express';
import Influencer from '../models/Influencer.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Register as an influencer
router.post('/register', auth, async (req, res) => {
  try {
    // Check if user is already registered as an influencer
    const existingInfluencer = await Influencer.findOne({ userId: req.user.id });
    if (existingInfluencer) {
      return res.status(400).json({ message: 'User is already registered as an influencer' });
    }

    // Create new influencer
    const { bio, websiteLink, socialLinks } = req.body;
    
    const newInfluencer = new Influencer({
      userId: req.user.id,
      bio,
      websiteLink,
      socialLinks
    });

    await newInfluencer.save();

    res.status(201).json(newInfluencer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's influencer profile
router.get('/me', auth, async (req, res) => {
  try {
    const influencer = await Influencer.findOne({ userId: req.user.id });
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer profile not found' });
    }

    res.json(influencer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update influencer profile
router.put('/update', auth, async (req, res) => {
  try {
    const { bio, websiteLink, socialLinks } = req.body;
    
    // Find and update influencer profile
    const influencer = await Influencer.findOneAndUpdate(
      { userId: req.user.id },
      { bio, websiteLink, socialLinks },
      { new: true, runValidators: true }
    );

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer profile not found' });
    }

    res.json(influencer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
