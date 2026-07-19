const DEFAULT_THRESHOLD = 0.55;

/**
 * Flags a classification as low-confidence so the frontend can suggest a
 * clearer retake, instead of silently proceeding with a shaky AI guess.
 * Kept as a pure function so it's testable without touching Gemini at all.
 */
export function isLowConfidence(classification, threshold = DEFAULT_THRESHOLD) {
  if (!classification || typeof classification.confidence !== "number") return false;
  return classification.confidence < threshold;
}
