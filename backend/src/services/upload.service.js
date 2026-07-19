import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

const isConfigured = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a base64 photo to Cloudinary and returns its permanent URL.
 * Same fail-safe pattern as the Gemini service: if credentials aren't
 * configured, or the upload fails, return null instead of throwing —
 * the complaint still gets created, just without a persisted photo.
 * The frontend already has its own local preview for the current session.
 *
 * @param {string} base64Image - raw base64 (no data: prefix)
 * @param {string} mimeType
 * @returns {Promise<string|null>}
 */
export async function uploadComplaintPhoto(base64Image, mimeType = "image/jpeg") {
  if (!isConfigured) {
    console.warn("[upload] Cloudinary not configured — skipping persistent image storage.");
    return null;
  }
  try {
    const dataUri = `data:${mimeType};base64,${base64Image}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "civiclens",
      resource_type: "image",
      transformation: [{ width: 1280, crop: "limit" }, { quality: "auto" }],
    });
    return result.secure_url;
  } catch (err) {
    console.warn("[upload] Cloudinary upload failed:", err.message);
    return null;
  }
}

export { isConfigured as isCloudinaryConfigured };
