import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    influencerId: { type: mongoose.Schema.Types.ObjectId, ref: "Influencer", required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    youtubeVideoUrl: { type: String, trim: true },
    youtubeVideoId: { type: String, trim: true },
    transcriptText: { type: String },
    thumbnailUrl: { type: String, trim: true },
    publishedAt: { type: Date },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
export default Post;
