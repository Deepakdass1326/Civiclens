import dotenv from "dotenv";
dotenv.config();

// Centralized env access — never read process.env directly anywhere else in the app.
// This makes it obvious at a glance what the app depends on, and lets us fail fast
// with a clear error instead of a confusing undefined deep in some service.

const required = (key, fallback = undefined) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    console.warn(`[env] Warning: ${key} is not set. Related features will not work.`);
  }
  return value;
};

export const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: required("MONGO_URI"),
  GEMINI_API_KEY: required("GEMINI_API_KEY"),
  GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || null,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || null,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || null,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || null,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || null,
  FORWARDING_WEBHOOK_URL: process.env.FORWARDING_WEBHOOK_URL || null,
  NODE_ENV: process.env.NODE_ENV || "development",
};
