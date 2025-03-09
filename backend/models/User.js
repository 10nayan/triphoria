const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
      username: { type: String, required: true, unique: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      passwordHash: { type: String, required: true },
      profilePicture: { type: String },
    },
    { timestamps: true }
  );

module.exports = mongoose.model('User', UserSchema);
