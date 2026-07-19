import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  if (!env.MONGO_URI) {
    console.error("[db] MONGO_URI missing — skipping DB connection.");
    return;
  }
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("[db] MongoDB connected");
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
