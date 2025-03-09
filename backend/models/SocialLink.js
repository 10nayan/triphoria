import mongoose from "mongoose";

const SocialLinkSchema = new mongoose.Schema(
  {
    influencerId: { type: mongoose.Schema.Types.ObjectId, ref: "Influencer", required: true },
    socialSite: { type: String, required: true, trim: true },
    profileLink: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const SocialLink = mongoose.model("SocialLink", SocialLinkSchema);
export default SocialLink;
