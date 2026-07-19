/**
 * Deterministic Impact Score engine.
 * Deliberately NOT a black-box ML model — every weight is explainable,
 * which matters both for authority trust and for judges evaluating the demo.
 *
 * impact_score = severity(0.35) + reportCount(0.25) + proximity(0.20)
 *              + traffic(0.10) + area(0.10)
 * All sub-scores are normalized to 0-1 before weighting, so final score is 0-1.
 */

const SEVERITY_SCORE = { low: 0.25, medium: 0.5, high: 0.75, critical: 1.0 };
const AREA_SCORE = { small: 0.33, medium: 0.66, large: 1.0 };
const ROAD_TYPE_SCORE = { residential: 0.4, arterial: 0.7, highway: 1.0 };

/**
 * Log-scaled so 1 report vs 2 reports matters more than 20 vs 21.
 * Caps at 1.0 around ~20 reports.
 */
function reportCountScore(reportCount) {
  if (reportCount <= 1) return 0.15;
  const score = Math.log2(reportCount) / Math.log2(20);
  return Math.min(score, 1.0);
}

function bandFromScore(score) {
  if (score >= 0.75) return "Critical";
  if (score >= 0.5) return "High";
  if (score >= 0.25) return "Medium";
  return "Low";
}

/**
 * @param {Object} input
 * @param {string} input.severity - low|medium|high|critical (from Gemini)
 * @param {number} input.reportCount - number of citizens who confirmed this issue
 * @param {boolean} input.nearHospitalOrSchool - proximity flag
 * @param {string} input.roadType - residential|arterial|highway (heuristic tag)
 * @param {string} input.estimatedArea - small|medium|large (from Gemini)
 * @returns {{ score: number, band: string, breakdown: Object }}
 */
/**
 * Builds the input object for calculateImpactScore() directly from a persisted
 * complaint document. This replaces the earlier support-recompute hack that
 * guessed nearHospitalOrSchool from the impactBand — now every input is the
 * exact value stored at creation time, so recompute is always accurate.
 *
 * @param {Object} complaint - a Mongoose complaint document (or plain object with the same shape)
 * @param {number} [overrideReportCount] - pass explicitly when the caller already bumped reportCount
 */
export function buildImpactInputFromComplaint(complaint, overrideReportCount) {
  return {
    severity: complaint.severity,
    reportCount: overrideReportCount ?? complaint.reportCount,
    nearHospitalOrSchool: Boolean(complaint.nearHospitalOrSchool),
    roadType: complaint.roadType || "residential",
    estimatedArea: complaint.estimatedArea || "medium",
  };
}

export function calculateImpactScore({
  severity = "low",
  reportCount = 1,
  nearHospitalOrSchool = false,
  roadType = "residential",
  estimatedArea = "medium",
}) {
  const severityWeighted = (SEVERITY_SCORE[severity] ?? 0.25) * 0.35;
  const reportWeighted = reportCountScore(reportCount) * 0.25;
  const proximityWeighted = (nearHospitalOrSchool ? 1.0 : 0.2) * 0.2;
  const trafficWeighted = (ROAD_TYPE_SCORE[roadType] ?? 0.4) * 0.1;
  const areaWeighted = (AREA_SCORE[estimatedArea] ?? 0.66) * 0.1;

  const score = severityWeighted + reportWeighted + proximityWeighted + trafficWeighted + areaWeighted;
  const rounded = Math.round(score * 100) / 100;

  return {
    score: rounded,
    band: bandFromScore(rounded),
    breakdown: {
      severity: Math.round(severityWeighted * 100) / 100,
      reportCount: Math.round(reportWeighted * 100) / 100,
      proximity: Math.round(proximityWeighted * 100) / 100,
      traffic: Math.round(trafficWeighted * 100) / 100,
      area: Math.round(areaWeighted * 100) / 100,
    },
  };
}
