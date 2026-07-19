import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { Complaint } from "../src/models/Complaint.model.js";
import { calculateImpactScore } from "../src/services/impactScore.service.js";
import { routeToDepartment } from "../src/services/routing.service.js";
import { generateReferenceId } from "../src/utils/referenceId.util.js";
import { appendStatusHistory } from "../src/utils/statusHistory.util.js";

const WARDS = ["Lajpat Nagar", "Saket", "Vasant Kunj", "Karol Bagh", "Rohini", "Dwarka"];
const STATUSES = ["pending", "pending", "pending", "in_progress", "resolved"]; // weighted toward pending

const SAMPLE_ISSUES = [
  { issueType: "pothole", severity: "high", estimatedArea: "large", roadType: "arterial", reportCount: 8 },
  { issueType: "pothole", severity: "medium", estimatedArea: "medium", roadType: "residential", reportCount: 2 },
  { issueType: "garbage", severity: "medium", estimatedArea: "medium", roadType: "residential", reportCount: 4 },
  { issueType: "garbage", severity: "low", estimatedArea: "small", roadType: "residential", reportCount: 1 },
  { issueType: "water_leakage", severity: "critical", estimatedArea: "large", roadType: "arterial", reportCount: 12, nearHospitalOrSchool: true },
  { issueType: "water_leakage", severity: "high", estimatedArea: "medium", roadType: "residential", reportCount: 5 },
  { issueType: "broken_streetlight", severity: "medium", estimatedArea: "small", roadType: "residential", reportCount: 3 },
  { issueType: "broken_streetlight", severity: "high", estimatedArea: "small", roadType: "arterial", reportCount: 6, nearHospitalOrSchool: true },
  { issueType: "fallen_tree", severity: "critical", estimatedArea: "large", roadType: "arterial", reportCount: 9 },
  { issueType: "illegal_dumping", severity: "high", estimatedArea: "large", roadType: "residential", reportCount: 7 },
  { issueType: "illegal_dumping", severity: "low", estimatedArea: "small", roadType: "residential", reportCount: 1 },
  { issueType: "pothole", severity: "critical", estimatedArea: "large", roadType: "highway", reportCount: 15, nearHospitalOrSchool: true },
  { issueType: "garbage", severity: "high", estimatedArea: "medium", roadType: "arterial", reportCount: 6 },
  { issueType: "water_leakage", severity: "medium", estimatedArea: "medium", roadType: "residential", reportCount: 3 },
  { issueType: "fallen_tree", severity: "medium", estimatedArea: "medium", roadType: "residential", reportCount: 2 },
  { issueType: "broken_streetlight", severity: "low", estimatedArea: "small", roadType: "residential", reportCount: 1 },
  { issueType: "pothole", severity: "high", estimatedArea: "medium", roadType: "arterial", reportCount: 4 },
  { issueType: "illegal_dumping", severity: "medium", estimatedArea: "medium", roadType: "residential", reportCount: 3 },
];

const BILINGUAL_TEMPLATE = (issueType, severity, ward, department, referenceId) => ({
  complaintTextEn: `Subject: Civic Issue Report — ${issueType.replace("_", " ")} (${severity} severity)\n\nLocation: ${ward}\nDepartment: ${department}\nReference: ${referenceId}\n\nA ${issueType.replace("_", " ")} has been reported in this area. Requesting prompt inspection and resolution.`,
  complaintTextHi: `विषय: नागरिक समस्या रिपोर्ट — ${issueType} (गंभीरता: ${severity})\n\nस्थान: ${ward}\nविभाग: ${department}\nसंदर्भ: ${referenceId}\n\nइस क्षेत्र में एक समस्या दर्ज की गई है। कृपया शीघ्र निरीक्षण एवं समाधान करें।`,
});

/**
 * Generates a jittered lat/lng within roughly `radiusKm` of a center point.
 * Deterministic-ish spread (not perfectly uniform, doesn't need to be — just
 * needs to look like real scattered ward data on the dashboard map).
 */
function jitterCoordinate(centerLat, centerLng, index, radiusKm = 4) {
  const angle = (index * 47) % 360; // spread indices around a circle
  const distanceKm = ((index * 13) % 100) / 100 * radiusKm;
  const dLat = (distanceKm / 111) * Math.cos((angle * Math.PI) / 180);
  const dLng = (distanceKm / (111 * Math.cos((centerLat * Math.PI) / 180))) * Math.sin((angle * Math.PI) / 180);
  return { lat: centerLat + dLat, lng: centerLng + dLng };
}

/**
 * Pure function — builds an array of ready-to-insert complaint documents.
 * No DB or network calls happen here, which is what makes it unit-testable.
 *
 * @param {number} centerLat - center of the pilot area (e.g. a Delhi locality)
 * @param {number} centerLng
 */
export function buildSeedComplaints(centerLat = 28.6139, centerLng = 77.209) {
  return SAMPLE_ISSUES.map((issue, index) => {
    const { lat, lng } = jitterCoordinate(centerLat, centerLng, index);
    const ward = WARDS[index % WARDS.length];
    const status = STATUSES[index % STATUSES.length];
    const department = routeToDepartment(issue.issueType);
    const referenceId = generateReferenceId();

    const { score, band, breakdown } = calculateImpactScore({
      severity: issue.severity,
      reportCount: issue.reportCount,
      nearHospitalOrSchool: Boolean(issue.nearHospitalOrSchool),
      roadType: issue.roadType,
      estimatedArea: issue.estimatedArea,
    });

    const { complaintTextEn, complaintTextHi } = BILINGUAL_TEMPLATE(
      issue.issueType,
      issue.severity,
      ward,
      department,
      referenceId
    );

    // Build a plausible history leading up to the final seeded status,
    // so the timeline UI has something believable to show.
    const daysAgo = 2 + (index % 5);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    let statusHistory = appendStatusHistory([], "pending", createdAt);
    if (status === "in_progress" || status === "resolved") {
      statusHistory = appendStatusHistory(statusHistory, "in_progress", new Date(createdAt.getTime() + 12 * 60 * 60 * 1000));
    }
    if (status === "resolved") {
      statusHistory = appendStatusHistory(statusHistory, "resolved", new Date(createdAt.getTime() + 36 * 60 * 60 * 1000));
    }

    return {
      issueType: issue.issueType,
      severity: issue.severity,
      confidence: 0.85,
      reasoning: `Seed data sample for demo purposes — ${issue.severity} severity ${issue.issueType.replace("_", " ")}.`,
      hazardNotes: issue.nearHospitalOrSchool ? "Near a hospital/school — elevated priority" : "",
      estimatedArea: issue.estimatedArea,
      roadType: issue.roadType,
      nearHospitalOrSchool: Boolean(issue.nearHospitalOrSchool),
      location: { type: "Point", coordinates: [lng, lat] },
      address: `${ward}, Delhi`,
      ward,
      department,
      impactScore: score,
      impactBand: band,
      impactBreakdown: breakdown,
      reportCount: issue.reportCount,
      supporters: [],
      complaintTextEn,
      complaintTextHi,
      imageUrl: null,
      inputMode: "photo",
      source: "demo_seed",
      verificationStatus: "unverified",
      status,
      statusHistory,
      referenceId,
    };
  });
}

// Only runs the actual DB insert when executed directly (not when imported for testing).
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  (async () => {
    await connectDB();
    const docs = buildSeedComplaints();
    await Complaint.insertMany(docs);
    console.log(`[seed] Inserted ${docs.length} sample complaints.`);
    await mongoose.disconnect();
  })();
}
