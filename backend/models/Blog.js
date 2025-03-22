import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    videoId: { type: String, required: true },
    videoThumbnail: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    slug: { type: String, required: true, unique: true },
    views: { type: Number, default: 0, index: true }, // Added index for faster sorting
  },
  { timestamps: true }
);

// Create compound indexes for faster queries
BlogSchema.index({ views: -1, createdAt: -1 });
BlogSchema.index({ userId: 1, views: -1 }); // Index for top influencers query


const Blog = mongoose.model('Blog', BlogSchema);
export default Blog;
