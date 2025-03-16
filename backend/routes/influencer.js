import express from 'express';
import Influencer from '../models/Influencer.js';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
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

// Get top influencers
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default to 10 influencers
    
    // Aggregate to find influencers with the most viewed blogs
    const topInfluencers = await Blog.aggregate([
      // Group by userId and sum the views
      { $group: {
          _id: "$userId",
          totalViews: { $sum: "$views" },
          blogCount: { $sum: 1 }
        }
      },
      // Sort by total views in descending order
      { $sort: { totalViews: -1 } },
      // Limit to the top N influencers
      { $limit: limit }
    ]);
    
    // Get the user IDs of the top influencers
    const userIds = topInfluencers.map(item => item._id);
    
    // Find the influencer profiles for these users
    const influencerProfiles = await Influencer.find({
      userId: { $in: userIds }
    });
    
    // Find the user details for these users
    const users = await User.find({
      _id: { $in: userIds }
    }).select('username firstName lastName profilePicture');
    
    // Create a map of user IDs to user details
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    // Create a map of user IDs to influencer profiles
    const influencerMap = {};
    influencerProfiles.forEach(profile => {
      influencerMap[profile.userId.toString()] = profile;
    });
    
    // Combine the data
    const result = topInfluencers.map(item => {
      const userId = item._id.toString();
      const user = userMap[userId];
      const influencer = influencerMap[userId];
      
      if (!user || !influencer) return null;
      
      return {
        user: {
          _id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture
        },
        influencer: {
          bio: influencer.bio,
          websiteLink: influencer.websiteLink,
          socialLinks: influencer.socialLinks
        },
        stats: {
          totalViews: item.totalViews,
          blogCount: item.blogCount
        }
      };
    }).filter(item => item !== null); // Remove any null entries
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
