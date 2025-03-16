import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    // Parse the MongoDB URI to extract components
    const mongoURI = process.env.MONGO_URI;
    
    // Connect with explicit dbName option to ensure the correct database is used
    await mongoose.connect(mongoURI, {
      dbName: 'triphoria'
    });
    
    console.log('MongoDB connected to database: triphoria');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};


export default connectDB;
