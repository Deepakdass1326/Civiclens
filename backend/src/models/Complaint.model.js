import mongoose from "mongoose";

const ISSUE_TYPES = [
  "pothole",
  "garbage",
  "water_leakage",
  "broken_streetlight",
  "fallen_tree",
  "illegal_dumping",
  "other",
];

const SEVERITY_LEVELS = ["low", "medium", "high", "critical"];
const IMPACT_BANDS = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["pending", "in_progress", "resolved"];
const DATA_SOURCES = ["official", "citizen_report", "field_survey", "demo_seed", "imported"];
const VERIFICATION_STATUSES = ["unverified", "field_verified", "authority_verified"];
const FORWARD_STATUSES = ["not_configured", "sent", "failed"];

const supporterSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Anonymous" },
    contact: { type: String, default: null },
    reportedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    issueType: { type: String, enum: ISSUE_TYPES, required: true },
    severity: { type: String, enum: SEVERITY_LEVELS, required: true },
    confidence: { type: Number, min: 0, max: 1, default: 0.8 },
    reasoning: { type: String, default: "" },
    hazardNotes: { type: String, default: "" },
    estimatedArea: { type: String, enum: ["small", "medium", "large"], default: "medium" },
    roadType: { type: String, enum: ["residential", "arterial", "highway"], default: "residential" },
    nearHospitalOrSchool: { type: Boolean, default: false },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: { type: String, default: "" },
    ward: { type: String, default: "" },

    department: { type: String, required: true },

    impactScore: { type: Number, default: 0 },
    impactBand: { type: String, enum: IMPACT_BANDS, default: "Low" },
    impactBreakdown: {
      severity: { type: Number, default: 0 },
      reportCount: { type: Number, default: 0 },
      proximity: { type: Number, default: 0 },
      traffic: { type: Number, default: 0 },
      area: { type: Number, default: 0 },
    },

    reportCount: { type: Number, default: 1 },
    supporters: { type: [supporterSchema], default: [] },

    complaintTextEn: { type: String, default: "" },
    complaintTextHi: { type: String, default: "" },

    imageUrl: { type: String, default: null },
    inputMode: { type: String, enum: ["photo", "voice"], default: "photo" },
    source: { type: String, enum: DATA_SOURCES, default: "citizen_report" },
    verificationStatus: { type: String, enum: VERIFICATION_STATUSES, default: "unverified" },
    verificationNote: { type: String, default: "" },
    verifiedAt: { type: Date, default: null },
    evidenceHash: { type: String, default: null, index: true },
    evidenceFlags: { type: [String], default: [] },
    forwardStatus: { type: String, enum: FORWARD_STATUSES, default: "not_configured" },
    externalReference: { type: String, default: null },

    status: { type: String, enum: STATUSES, default: "pending" },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: STATUSES },
          changedAt: { type: Date, default: Date.now },
        },
      ],
      default: () => [{ status: "pending", changedAt: new Date() }],
      _id: false,
    },
    referenceId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

complaintSchema.index({ location: "2dsphere" });
complaintSchema.index({ issueType: 1, status: 1 });

export const Complaint = mongoose.model("Complaint", complaintSchema);
export { ISSUE_TYPES, SEVERITY_LEVELS, IMPACT_BANDS, STATUSES, DATA_SOURCES, VERIFICATION_STATUSES, FORWARD_STATUSES };
