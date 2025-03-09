import mongoose from "mongoose";

const PostTagSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    tagId: { type: mongoose.Schema.Types.ObjectId, ref: "Tag", required: true },
  },
  { timestamps: true }
);

// Ensure uniqueness of post-tag pairs
PostTagSchema.index({ postId: 1, tagId: 1 }, { unique: true });

const PostTag = mongoose.model("PostTag", PostTagSchema);
export default PostTag;
