import asyncHandler from "express-async-handler";
import { Complaint } from "../models/Complaint.model.js";
import { classifyIssueImage, classifyIssueText, generateComplaintText } from "../services/gemini.service.js";
import { calculateImpactScore, buildImpactInputFromComplaint } from "../services/impactScore.service.js";
import { routeToDepartment } from "../services/routing.service.js";
import { findNearbyDuplicate, addSupporter } from "../services/duplicate.service.js";
import { reverseGeocode, isNearHospitalOrSchool } from "../services/geo.service.js";
import { generateReferenceId } from "../utils/referenceId.util.js";
import { uploadComplaintPhoto } from "../services/upload.service.js";
import { appendStatusHistory, shouldRecordStatusChange } from "../utils/statusHistory.util.js";
import { isLowConfidence } from "../utils/confidence.util.js";
import {
  parseRequest,
  classifyRequestSchema,
  createComplaintRequestSchema,
  supportRequestSchema,
  statusRequestSchema,
  verificationRequestSchema,
} from "../utils/requestValidation.util.js";
import { forwardComplaint } from "../services/forwarding.service.js";
import { buildEvidenceFlags, hashEvidence } from "../utils/evidence.util.js";

/**
 * POST /api/complaints/classify
 * Classifies a photo or voice-transcribed text WITHOUT writing to the DB yet.
 * Lets the frontend show the AI result before the citizen commits to submitting.
 */
export const classify = asyncHandler(async (req, res) => {
  const { imageBase64, mimeType, description } = parseRequest(classifyRequestSchema, req.body);

  let classification;
  if (imageBase64) {
    classification = await classifyIssueImage(imageBase64, mimeType || "image/jpeg");
  } else if (description) {
    classification = await classifyIssueText(description);
  } else {
    res.status(400);
    throw new Error("Provide either imageBase64 or description");
  }

  res.json({ success: true, classification, lowConfidence: isLowConfidence(classification) });
});

/**
 * POST /api/complaints
 * Full submission flow: duplicate check -> create or support -> score -> route -> generate text.
 */
export const createComplaint = asyncHandler(async (req, res) => {
  const {
    classification,
    lat,
    lng,
    inputMode,
    imageBase64,
    imageMimeType,
    reporter,
    roadType,
  } = parseRequest(createComplaintRequestSchema, req.body);

  const evidenceHash = hashEvidence(imageBase64);
  if (evidenceHash) {
    const sameEvidence = await Complaint.findOne({ evidenceHash, status: { $ne: "resolved" } });
    if (sameEvidence) {
      return res.json({
        success: true,
        duplicate: true,
        complaint: sameEvidence,
        message: "This exact photo is already attached to an active complaint. Support that complaint instead?",
      });
    }
  }

  // 1. Duplicate check first — this is the "already reported" wow-moment path
  const existing = await findNearbyDuplicate(lng, lat, classification.issue_type);
  if (existing) {
    return res.json({
      success: true,
      duplicate: true,
      complaint: existing,
      message: "This issue is already reported nearby. Support this complaint instead?",
    });
  }

  // 2. Location intelligence
  const [{ address, ward }, nearHospitalOrSchool, imageUrl] = await Promise.all([
    reverseGeocode(lat, lng),
    isNearHospitalOrSchool(lat, lng),
    imageBase64 ? uploadComplaintPhoto(imageBase64, imageMimeType) : Promise.resolve(null),
  ]);

  // 2b. Persist the photo (best-effort — never blocks submission if it fails)

  // 3. Routing + scoring
  const department = routeToDepartment(classification.issue_type);
  const { score, band, breakdown } = calculateImpactScore({
    severity: classification.severity,
    reportCount: 1,
    nearHospitalOrSchool,
    roadType,
    estimatedArea: classification.estimated_area,
  });

  const referenceId = generateReferenceId();

  // 4. Bilingual complaint generation
  const { complaint_en, complaint_hi } = await generateComplaintText({
    issueType: classification.issue_type,
    severity: classification.severity,
    address,
    department,
    reasoning: classification.reasoning,
    referenceId,
  });

  // 5. Persist
  const complaint = await Complaint.create({
    issueType: classification.issue_type,
    severity: classification.severity,
    confidence: classification.confidence,
    reasoning: classification.reasoning,
    hazardNotes: classification.hazard_notes,
    estimatedArea: classification.estimated_area,
    location: { type: "Point", coordinates: [lng, lat] },
    address,
    ward,
    department,
    impactScore: score,
    impactBand: band,
    impactBreakdown: breakdown,
    roadType,
    nearHospitalOrSchool,
    complaintTextEn: complaint_en,
    complaintTextHi: complaint_hi,
    imageUrl,
    inputMode,
    source: "citizen_report",
    verificationStatus: "unverified",
    verificationNote: "",
    verifiedAt: null,
    evidenceHash,
    evidenceFlags: buildEvidenceFlags({ imageBase64, confidence: classification.confidence }),
    referenceId,
    supporters: reporter.name ? [{ name: reporter.name, contact: reporter.contact || null }] : [],
  });

  const forwarding = await forwardComplaint(complaint.toObject());
  complaint.forwardStatus = forwarding.status;
  complaint.externalReference = forwarding.externalReference;
  await complaint.save();

  res.status(201).json({ success: true, duplicate: false, complaint });
});

/**
 * POST /api/complaints/:id/support
 * Citizen confirms "I have this issue too" on an existing complaint.
 */
export const supportComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, contact } = parseRequest(supportRequestSchema, req.body);

  const complaint = await addSupporter(id, { name, contact });
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  // Recompute impact score live using the EXACT values stored at creation —
  // no more guessing nearHospitalOrSchool from the previous impactBand.
  const { score, band, breakdown } = calculateImpactScore(buildImpactInputFromComplaint(complaint));
  complaint.impactScore = score;
  complaint.impactBand = band;
  complaint.impactBreakdown = breakdown;
  await complaint.save();

  res.json({ success: true, complaint });
});

/**
 * GET /api/complaints?ward=&department=&severity=&status=
 */
export const listComplaints = asyncHandler(async (req, res) => {
  const { ward, department, severity, status, source } = req.query;
  const filter = {};
  if (ward) filter.ward = ward;
  if (department) filter.department = department;
  if (severity) filter.severity = severity;
  if (status) filter.status = status;
  if (source === "real") filter.source = { $ne: "demo_seed" };
  else if (source) filter.source = source;

  const complaints = await Complaint.find(filter).sort({ impactScore: -1, createdAt: -1 });
  res.json({ success: true, count: complaints.length, complaints });
});

/**
 * GET /api/complaints/:id
 */
export const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }
  res.json({ success: true, complaint });
});

/**
 * PATCH /api/complaints/:id/status
 */
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = parseRequest(statusRequestSchema, req.body);
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  if (shouldRecordStatusChange(complaint.statusHistory, status)) {
    complaint.statusHistory = appendStatusHistory(complaint.statusHistory, status);
  }
  complaint.status = status;
  await complaint.save();

  res.json({ success: true, complaint });
});

export const updateVerification = asyncHandler(async (req, res) => {
  const { verificationStatus, verificationNote } = parseRequest(verificationRequestSchema, req.body);
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  complaint.verificationStatus = verificationStatus;
  complaint.verificationNote = verificationNote;
  complaint.verifiedAt = verificationStatus === "unverified" ? null : new Date();
  await complaint.save();
  res.json({ success: true, complaint });
});
