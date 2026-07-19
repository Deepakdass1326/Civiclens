import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { env } from "../config/env.js";
import { extractJson, JsonExtractionError } from "../utils/jsonExtractor.util.js";

const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
const VISION_MODEL = "gemini-1.5-flash";
const TEXT_MODEL = "gemini-1.5-flash";

// ---- Schemas (single source of truth for shape validation) ----

const classificationSchema = z.object({
  issue_type: z.enum([
    "pothole",
    "garbage",
    "water_leakage",
    "broken_streetlight",
    "fallen_tree",
    "illegal_dumping",
    "other",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  estimated_area: z.enum(["small", "medium", "large"]),
  hazard_notes: z.string().optional().default(""),
});

const complaintTextSchema = z.object({
  complaint_en: z.string(),
  complaint_hi: z.string(),
});

// Safe fallback if Gemini is unreachable or output can't be salvaged even after retry —
// the demo must never show a raw error screen.
const FALLBACK_CLASSIFICATION = {
  issue_type: "other",
  severity: "medium",
  confidence: 0.4,
  reasoning: "Automatic classification unavailable — flagged for manual review.",
  estimated_area: "medium",
  hazard_notes: "",
};

const CLASSIFICATION_PROMPT = `You are a civic inspection assistant analyzing a photo of a road/street issue in India.
Classify the image STRICTLY into one of these issue types: pothole, garbage, water_leakage, broken_streetlight, fallen_tree, illegal_dumping, other.
Assess severity as one of: low, medium, high, critical — based on visible size, depth, obstruction of road/traffic, and safety hazard (e.g. exposed wiring, standing water, blocked path).
Respond with ONLY valid JSON, no markdown fences, no extra prose, matching exactly this shape:
{"issue_type":"...","severity":"...","confidence":0.0,"reasoning":"one short sentence","estimated_area":"small|medium|large","hazard_notes":"short phrase or empty string"}`;

async function callGeminiVision(base64Image, mimeType) {
  if (!genAI) throw new Error("GEMINI_API_KEY not configured");
  const model = genAI.getGenerativeModel({ model: VISION_MODEL });
  const result = await model.generateContent([
    CLASSIFICATION_PROMPT,
    { inlineData: { data: base64Image, mimeType } },
  ]);
  return result.response.text();
}

/**
 * Classifies a civic issue photo. Retries once on parse/validation failure,
 * then falls back to a safe default rather than throwing to the client.
 */
export async function classifyIssueImage(base64Image, mimeType = "image/jpeg") {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callGeminiVision(base64Image, mimeType);
      const parsed = extractJson(raw);
      return classificationSchema.parse(parsed);
    } catch (err) {
      console.warn(`[gemini] classification attempt ${attempt + 1} failed:`, err.message);
    }
  }
  return FALLBACK_CLASSIFICATION;
}

/**
 * Classifies a civic issue from a voice-transcribed text description (Hindi/English).
 */
export async function classifyIssueText(description) {
  if (!genAI) return FALLBACK_CLASSIFICATION;
  const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
  const prompt = `${CLASSIFICATION_PROMPT}\n\nThe citizen described the issue in their own words (Hindi/English mix): "${description}"`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const parsed = extractJson(result.response.text());
      return classificationSchema.parse(parsed);
    } catch (err) {
      console.warn(`[gemini] text classification attempt ${attempt + 1} failed:`, err.message);
    }
  }
  return FALLBACK_CLASSIFICATION;
}

/**
 * Generates a bilingual (Hindi + English) formal complaint from structured classification data.
 */
export async function generateComplaintText({ issueType, severity, address, department, reasoning, referenceId }) {
  const fallback = {
    complaint_en: `Subject: Civic Issue Report — ${issueType} (${severity} severity)\n\nLocation: ${address}\nDepartment: ${department}\nReference: ${referenceId}\n\nA ${issueType.replace("_", " ")} has been reported at the above location. Requesting prompt inspection and resolution.`,
    complaint_hi: `विषय: नागरिक समस्या रिपोर्ट — ${issueType} (गंभीरता: ${severity})\n\nस्थान: ${address}\nविभाग: ${department}\nसंदर्भ: ${referenceId}\n\nउपरोक्त स्थान पर एक समस्या दर्ज की गई है। कृपया शीघ्र निरीक्षण एवं समाधान करें।`,
  };

  if (!genAI) return fallback;

  const model = genAI.getGenerativeModel({ model: TEXT_MODEL });
  const prompt = `You are drafting a formal municipal civic complaint on behalf of a citizen in India.
Given this structured data:
- Issue type: ${issueType}
- Severity: ${severity}
- Location: ${address}
- Target department: ${department}
- AI reasoning: ${reasoning}
- Reference ID: ${referenceId}

Write TWO versions of a short, respectful, factual formal complaint letter (salutation, issue description, location, urgency framing, request for action, reference ID) — one in English, one in Hindi.
Do not invent any facts, dates, or prior correspondence not given above.
Respond with ONLY valid JSON, no markdown fences:
{"complaint_en":"...","complaint_hi":"..."}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const parsed = extractJson(result.response.text());
      return complaintTextSchema.parse(parsed);
    } catch (err) {
      console.warn(`[gemini] complaint generation attempt ${attempt + 1} failed:`, err.message);
    }
  }
  return fallback;
}
