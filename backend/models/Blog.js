import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    videoId: { type: String, required: true },
    videoThumbnail: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    slug: { type: String, required: true, unique: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);


const Blog = mongoose.model('Blog', BlogSchema);
export default Blog;
