import mongoose from "mongoose";

/**
 * Connects application to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error(error.message);

    // Stop app if DB connection fails
    process.exit(1);
  }
};

export default connectDB;
