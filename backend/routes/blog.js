import express from 'express';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Influencer from '../models/Influencer.js';
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

// Middleware to check if user is an influencer
const influencerCheck = async (req, res, next) => {
  try {
    const influencer = await Influencer.findOne({ userId: req.user.id });
    if (!influencer) {
      return res.status(403).json({ message: 'User is not an influencer' });
    }
    req.influencer = influencer;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new blog
router.post('/', auth, influencerCheck, async (req, res) => {
  try {
    const { title, content, videoId, videoThumbnail } = req.body;
    
    // Generate a slug from the title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    // Add a unique identifier (timestamp)
    const timestamp = new Date().getTime().toString().slice(-6);
    const userId = req.user.id.toString().slice(-6);
    const slug = `${baseSlug}-${userId}${timestamp}`;
    
    const newBlog = new Blog({
      userId: req.user.id,
      title,
      content,
      videoId,
      videoThumbnail,
      slug
    });

    await newBlog.save();

    res.status(201).json(newBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'username firstName lastName');
    
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get most viewed blogs
router.get('/most-viewed', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6; // Default to 6 blogs
    
    const blogs = await Blog.find()
      .sort({ views: -1 }) // Sort by views in descending order
      .limit(limit)
      .populate({
        path: 'userId',
        select: 'username firstName lastName profilePicture',
        model: 'User'
      });
    
    // For each blog, check if the user is an influencer
    const blogsWithInfluencerInfo = await Promise.all(
      blogs.map(async (blog) => {
        const influencer = await Influencer.findOne({ userId: blog.userId._id });
        return {
          ...blog.toObject(),
          isInfluencer: !!influencer
        };
      })
    );
    
    res.json(blogsWithInfluencerInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blogs by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const blogs = await Blog.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username firstName lastName');
    
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blog by slug (without userId in path)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('userId', 'username firstName lastName');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();
    
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blog by slug with username in path
router.get('/user/:username/:slug', async (req, res) => {
  try {
    // First, check if the user exists and is an influencer
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const influencer = await Influencer.findOne({ userId: user._id });
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    
    // Extract the base slug without the unique identifier
    const baseSlug = req.params.slug;
    
    // Find blogs that match the base slug pattern
    const blog = await Blog.findOne({ 
      userId: user._id,
      slug: { $regex: new RegExp(`^${baseSlug}-[a-f0-9]+$`) }
    }).populate('userId', 'username firstName lastName');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();
    
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a blog
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if the blog has already been liked by this user
    if (blog.likes.includes(req.user.id)) {
      // Unlike the blog
      blog.likes = blog.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Like the blog
      blog.likes.push(req.user.id);
    }

    await blog.save();
    
    res.json({ likes: blog.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a blog
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const { content } = req.body;
    
    const newComment = new Comment({
      blogId: req.params.id,
      userId: req.user.id,
      content
    });

    await newComment.save();

    // Populate user data
    const populatedComment = await Comment.findById(newComment._id)
      .populate('userId', 'username firstName lastName');
    
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a blog
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username firstName lastName');
    
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a comment
router.post('/comment/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the comment has already been liked by this user
    if (comment.likes.includes(req.user.id)) {
      // Unlike the comment
      comment.likes = comment.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Like the comment
      comment.likes.push(req.user.id);
    }

    await comment.save();
    
    res.json({ likes: comment.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get influencer details and their blogs
router.get('/influencer/:username', async (req, res) => {
  try {
    // Check if the user exists and is an influencer
    const user = await User.findOne({ username: req.params.username })
      .select('-passwordHash'); // Exclude password hash
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const influencer = await Influencer.findOne({ userId: user._id });
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    
    // Get all blogs by this influencer
    const blogs = await Blog.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username firstName lastName');
    
    // Combine user, influencer, and blogs data
    const response = {
      user: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
      },
      influencer: {
        bio: influencer.bio,
        websiteLink: influencer.websiteLink,
        socialLinks: influencer.socialLinks,
      },
      blogs: blogs
    };
    
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
