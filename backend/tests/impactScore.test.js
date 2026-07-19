import test from "node:test";
import assert from "node:assert";
import { calculateImpactScore } from "../src/services/impactScore.service.js";

test("critical severity near hospital scores higher than low severity residential", () => {
  const critical = calculateImpactScore({ severity: "critical", reportCount: 1, nearHospitalOrSchool: true, roadType: "arterial", estimatedArea: "large" });
  const low = calculateImpactScore({ severity: "low", reportCount: 1, nearHospitalOrSchool: false, roadType: "residential", estimatedArea: "small" });
  assert.ok(critical.score > low.score, `expected ${critical.score} > ${low.score}`);
  assert.strictEqual(critical.band, "Critical");
  assert.strictEqual(low.band, "Low");
});

test("score increases as reportCount increases (the demo 'wow' moment)", () => {
  const base = { severity: "medium", nearHospitalOrSchool: false, roadType: "residential", estimatedArea: "medium" };
  const oneReport = calculateImpactScore({ ...base, reportCount: 1 });
  const fiveReports = calculateImpactScore({ ...base, reportCount: 5 });
  const twentyReports = calculateImpactScore({ ...base, reportCount: 20 });
  assert.ok(fiveReports.score > oneReport.score);
  assert.ok(twentyReports.score > fiveReports.score);
});

test("score is always between 0 and 1", () => {
  const worst = calculateImpactScore({ severity: "critical", reportCount: 50, nearHospitalOrSchool: true, roadType: "highway", estimatedArea: "large" });
  const best = calculateImpactScore({ severity: "low", reportCount: 1, nearHospitalOrSchool: false, roadType: "residential", estimatedArea: "small" });
  assert.ok(worst.score <= 1.0);
  assert.ok(best.score >= 0);
});

test("breakdown sub-scores sum to total score", () => {
  const result = calculateImpactScore({ severity: "high", reportCount: 3, nearHospitalOrSchool: true, roadType: "arterial", estimatedArea: "medium" });
  const sum = Object.values(result.breakdown).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - result.score) < 0.02, `breakdown sum ${sum} should ≈ total ${result.score}`);
});

test("buildImpactInputFromComplaint pulls exact stored values (no guessing)", async () => {
  const { buildImpactInputFromComplaint, calculateImpactScore } = await import("../src/services/impactScore.service.js");
  const fakeComplaintDoc = {
    severity: "critical",
    reportCount: 3,
    nearHospitalOrSchool: true,
    roadType: "arterial",
    estimatedArea: "large",
  };
  const input = buildImpactInputFromComplaint(fakeComplaintDoc);
  assert.deepStrictEqual(input, {
    severity: "critical",
    reportCount: 3,
    nearHospitalOrSchool: true,
    roadType: "arterial",
    estimatedArea: "large",
  });
  const result = calculateImpactScore(input);
  assert.strictEqual(result.band, "Critical");
});

test("buildImpactInputFromComplaint honors overrideReportCount", async () => {
  const { buildImpactInputFromComplaint } = await import("../src/services/impactScore.service.js");
  const fakeComplaintDoc = { severity: "low", reportCount: 1, nearHospitalOrSchool: false, roadType: "residential", estimatedArea: "small" };
  const input = buildImpactInputFromComplaint(fakeComplaintDoc, 7);
  assert.strictEqual(input.reportCount, 7);
});

test("buildImpactInputFromComplaint defaults missing roadType/estimatedArea safely", async () => {
  const { buildImpactInputFromComplaint } = await import("../src/services/impactScore.service.js");
  const sparseDoc = { severity: "medium", reportCount: 2, nearHospitalOrSchool: false };
  const input = buildImpactInputFromComplaint(sparseDoc);
  assert.strictEqual(input.roadType, "residential");
  assert.strictEqual(input.estimatedArea, "medium");
});
