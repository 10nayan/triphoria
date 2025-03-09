import mongoose from 'mongoose';

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

const User = mongoose.model('User', UserSchema);
export default User;
