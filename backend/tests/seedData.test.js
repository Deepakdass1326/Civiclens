import test from "node:test";
import assert from "node:assert";
import { buildSeedComplaints } from "../scripts/seedData.js";

const VALID_ISSUE_TYPES = ["pothole", "garbage", "water_leakage", "broken_streetlight", "fallen_tree", "illegal_dumping", "other"];
const VALID_SEVERITIES = ["low", "medium", "high", "critical"];
const VALID_STATUSES = ["pending", "in_progress", "resolved"];
const VALID_BANDS = ["Low", "Medium", "High", "Critical"];

test("generates a non-trivial number of complaints (enough to not look empty on a map)", () => {
  const docs = buildSeedComplaints();
  assert.ok(docs.length >= 15, `expected at least 15 seed complaints, got ${docs.length}`);
});

test("every generated complaint has all required schema fields with valid enum values", () => {
  const docs = buildSeedComplaints();
  for (const doc of docs) {
    assert.ok(VALID_ISSUE_TYPES.includes(doc.issueType), `invalid issueType: ${doc.issueType}`);
    assert.ok(VALID_SEVERITIES.includes(doc.severity), `invalid severity: ${doc.severity}`);
    assert.ok(VALID_STATUSES.includes(doc.status), `invalid status: ${doc.status}`);
    assert.ok(VALID_BANDS.includes(doc.impactBand), `invalid impactBand: ${doc.impactBand}`);
    assert.ok(doc.referenceId.startsWith("CLN-"));
    assert.ok(typeof doc.reportCount === "number" && doc.reportCount >= 1);
    assert.ok(doc.complaintTextEn.length > 0 && doc.complaintTextHi.length > 0);
  }
});

test("coordinates stay within a plausible radius of the given center point (Delhi test)", () => {
  const centerLat = 28.6139, centerLng = 77.209;
  const docs = buildSeedComplaints(centerLat, centerLng);
  for (const doc of docs) {
    const [lng, lat] = doc.location.coordinates;
    const distanceKm = Math.sqrt(((lat - centerLat) * 111) ** 2 + ((lng - centerLng) * 111 * Math.cos(centerLat * Math.PI / 180)) ** 2);
    assert.ok(distanceKm <= 6, `complaint ${doc.referenceId} is ${distanceKm.toFixed(2)}km from center, expected <= 6km`);
  }
});

test("impact scores are internally consistent - critical/high-report-count issues score higher than low/single-report ones", () => {
  const docs = buildSeedComplaints();
  const criticalHighReports = docs.filter((d) => d.severity === "critical" && d.reportCount > 8);
  const lowSingleReport = docs.filter((d) => d.severity === "low" && d.reportCount === 1);
  assert.ok(criticalHighReports.length > 0 && lowSingleReport.length > 0, "test fixture should include both extremes");
  const avgCritical = criticalHighReports.reduce((s, d) => s + d.impactScore, 0) / criticalHighReports.length;
  const avgLow = lowSingleReport.reduce((s, d) => s + d.impactScore, 0) / lowSingleReport.length;
  assert.ok(avgCritical > avgLow, `expected critical avg ${avgCritical} > low avg ${avgLow}`);
});

test("produces a realistic mix of statuses (not all identical)", () => {
  const docs = buildSeedComplaints();
  const uniqueStatuses = new Set(docs.map((d) => d.status));
  assert.ok(uniqueStatuses.size > 1, "expected a mix of pending/in_progress/resolved for a realistic dashboard");
});

test("reference IDs are unique across the batch", () => {
  const docs = buildSeedComplaints();
  const ids = docs.map((d) => d.referenceId);
  assert.strictEqual(new Set(ids).size, ids.length, "duplicate reference IDs found");
});

test("statusHistory's last entry always matches the complaint's final status", () => {
  const docs = buildSeedComplaints();
  for (const doc of docs) {
    const last = doc.statusHistory[doc.statusHistory.length - 1];
    assert.strictEqual(last.status, doc.status, `mismatch for ${doc.referenceId}`);
    assert.strictEqual(doc.statusHistory[0].status, "pending", "history should always start at pending");
  }
});
