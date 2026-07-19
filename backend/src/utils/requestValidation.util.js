import { z } from "zod";

const classificationSchema = z.object({
  issue_type: z.enum(["pothole", "garbage", "water_leakage", "broken_streetlight", "fallen_tree", "illegal_dumping", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().trim().min(1).max(1000),
  estimated_area: z.enum(["small", "medium", "large"]),
  hazard_notes: z.string().max(500).optional().default(""),
});

export const classifyRequestSchema = z.object({
  imageBase64: z.string().min(20).max(8_000_000).optional(),
  mimeType: z.string().regex(/^image\/(jpeg|png|webp|jpg)$/i).optional(),
  description: z.string().trim().min(3).max(2000).optional(),
}).refine((body) => Boolean(body.imageBase64) !== Boolean(body.description), {
  message: "Provide exactly one of imageBase64 or description",
});

export const createComplaintRequestSchema = z.object({
  classification: classificationSchema,
  lat: z.coerce.number().finite().min(-90).max(90),
  lng: z.coerce.number().finite().min(-180).max(180),
  inputMode: z.enum(["photo", "voice"]).default("photo"),
  imageBase64: z.string().max(8_000_000).nullable().optional().default(null),
  imageMimeType: z.string().regex(/^image\/(jpeg|png|webp|jpg)$/i).default("image/jpeg"),
  reporter: z.object({
    name: z.string().trim().max(80).optional(),
    contact: z.string().trim().max(160).optional(),
  }).default({}),
  roadType: z.enum(["residential", "arterial", "highway"]).default("residential"),
});

export const supportRequestSchema = z.object({
  name: z.string().trim().max(80).optional(),
  contact: z.string().trim().max(160).optional(),
}).default({});

export const statusRequestSchema = z.object({
  status: z.enum(["pending", "in_progress", "resolved"]),
});

export const verificationRequestSchema = z.object({
  verificationStatus: z.enum(["unverified", "field_verified", "authority_verified"]),
  verificationNote: z.string().trim().max(500).optional().default(""),
});

export function parseRequest(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join("; ");
    const error = new Error(message || "Invalid request");
    error.statusCode = 400;
    throw error;
  }
  return result.data;
}
