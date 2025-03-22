import express from 'express';
import Influencer from '../models/Influencer.js';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Simple in-memory cache for top influencers
const cache = {
  topInfluencers: {
    data: null,
    timestamp: 0,
    ttl: 10 * 60 * 1000 // 10 minutes in milliseconds
  }
};

// Function to check if cache is valid
const isCacheValid = (cacheKey) => {
  const cacheItem = cache[cacheKey];
  if (!cacheItem.data) return false;
  
  const now = Date.now();
  return (now - cacheItem.timestamp) < cacheItem.ttl;
};

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

// Get top influencers - Optimized version
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default to 10 influencers
    const cacheKey = 'topInfluencers';
    
    // Check if we have valid cached data
    if (isCacheValid(cacheKey) && cache[cacheKey].limit === limit) {
      return res.json(cache[cacheKey].data);
    }
    
    // Use an optimized aggregation pipeline with lookups
    const result = await Blog.aggregate([
      // Stage 1: Group by userId and calculate stats
      { 
        $group: {
          _id: "$userId",
          totalViews: { $sum: "$views" },
          blogCount: { $sum: 1 }
        }
      },
      
      // Stage 2: Only include users who are influencers (join with influencers collection)
      {
        $lookup: {
          from: 'influencers',
          localField: '_id',
          foreignField: 'userId',
          as: 'influencerInfo'
        }
      },
      
      // Stage 3: Filter out users who are not influencers
      {
        $match: {
          'influencerInfo': { $ne: [] }
        }
      },
      
      // Stage 4: Sort by total views in descending order
      { 
        $sort: { 
          totalViews: -1 
        } 
      },
      
      // Stage 5: Limit to the top N influencers
      { 
        $limit: limit 
      },
      
      // Stage 6: Lookup user details
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      
      // Stage 7: Format the response
      {
        $project: {
          _id: 0,
          user: {
            _id: { $arrayElemAt: ['$userInfo._id', 0] },
            username: { $arrayElemAt: ['$userInfo.username', 0] },
            firstName: { $arrayElemAt: ['$userInfo.firstName', 0] },
            lastName: { $arrayElemAt: ['$userInfo.lastName', 0] },
            profilePicture: { $arrayElemAt: ['$userInfo.profilePicture', 0] }
          },
          influencer: {
            bio: { $arrayElemAt: ['$influencerInfo.bio', 0] },
            websiteLink: { $arrayElemAt: ['$influencerInfo.websiteLink', 0] },
            socialLinks: { $arrayElemAt: ['$influencerInfo.socialLinks', 0] }
          },
          stats: {
            totalViews: '$totalViews',
            blogCount: '$blogCount'
          }
        }
      }
    ]);
    
    // Update cache
    cache[cacheKey] = {
      data: result,
      timestamp: Date.now(),
      limit: limit,
      ttl: 10 * 60 * 1000 // 10 minutes
    };
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching top influencers:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
