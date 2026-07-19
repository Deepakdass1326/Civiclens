/**
 * Gemini sometimes wraps JSON in ```json fences, adds a stray sentence before/after,
 * or adds trailing commas. This is the single highest-risk failure point in a live
 * demo, so we extract defensively instead of trusting JSON.parse on the raw string.
 *
 * Strategy:
 *  1. Strip markdown code fences if present.
 *  2. Try direct JSON.parse.
 *  3. Fall back to regex-extracting the outermost {...} block and parsing that.
 *  4. If everything fails, throw a typed error so the caller can retry once
 *     or fall back to a safe default (see gemini.service.js).
 */
export class JsonExtractionError extends Error {
  constructor(message, rawText) {
    super(message);
    this.name = "JsonExtractionError";
    this.rawText = rawText;
  }
}

export function extractJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new JsonExtractionError("Empty or non-string response from model", rawText);
  }

  let cleaned = rawText.trim();

  // Strip ```json ... ``` or ``` ... ``` fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");

  // Attempt 1: direct parse
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // continue to fallback
  }

  // Attempt 2: extract the outermost { ... } block
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {
      // continue to failure
    }
  }

  throw new JsonExtractionError("Could not extract valid JSON from model response", rawText);
}
