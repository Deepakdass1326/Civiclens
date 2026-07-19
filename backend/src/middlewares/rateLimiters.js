import rateLimit from "express-rate-limit";

/**
 * Stricter limit on AI-calling and write endpoints (classify, create, support) —
 * these hit Gemini/Cloudinary and cost money/quota, and are the most likely
 * target for someone spamming fake reports or duplicate "support" clicks.
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests — please slow down and try again in a minute." },
});

/**
 * Looser limit for read-only dashboard endpoints, mainly to prevent scraping abuse
 * without getting in the way of normal browsing/refreshing.
 */
export const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests — please slow down." },
});
