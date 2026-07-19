import { app } from "../backend/src/app.js";
import { connectDB } from "../backend/src/config/db.js";

// Cache DB connection across warm serverless invocations
let isConnected = false;

export default async function handler(req, res) {
  // Keep health checks available even when MongoDB is unavailable.
  // A failed DB connection should return a useful API response instead of
  // Vercel's generic FUNCTION_INVOCATION_FAILED page.
  const requestPath = new URL(req.url || "/", "http://localhost").pathname;
  const isHealthCheck = requestPath === "/health";

  if (!isHealthCheck && !isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error("[vercel] MongoDB connection failed:", error.message);
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Check the MONGO_URI deployment variable.",
      });
    }
  }
  return app(req, res);
}
