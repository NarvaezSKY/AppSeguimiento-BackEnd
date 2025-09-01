import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MONGODB_URI } from '../config/config.js';

dotenv.config();


export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connection established successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
