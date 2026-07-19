import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  if (!env.MONGO_URI) {
    console.error("[db] MONGO_URI missing — skipping DB connection.");
    return;
  }
  // If already connected (warm serverless invocation), reuse the connection
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("[db] MongoDB connected");
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);
    throw err; // Let the serverless handler return a 500 instead of crashing
  }
};
