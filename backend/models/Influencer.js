import mongoose from "mongoose";

const InfluencerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio: { type: String, maxlength: 500 },
    websiteLink: { type: String, trim: true },
    socialLinks: [{ type: String, trim: true }], // Array of links
  },
  { timestamps: true }
);

const Influencer = mongoose.model("Influencer", InfluencerSchema);
export default Influencer;
