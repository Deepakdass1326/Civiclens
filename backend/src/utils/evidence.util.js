import { createHash } from "node:crypto";

export function hashEvidence(base64Image) {
  if (!base64Image || typeof base64Image !== "string") return null;
  return createHash("sha256").update(base64Image, "base64").digest("hex");
}

export function buildEvidenceFlags({ imageBase64, confidence }) {
  const flags = [];
  if (!imageBase64) flags.push("no_photo");
  if (typeof confidence === "number" && confidence < 0.55) flags.push("low_ai_confidence");
  return flags;
}

