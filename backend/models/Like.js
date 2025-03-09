const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Ensure a user can like a post only once
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Like", LikeSchema);
