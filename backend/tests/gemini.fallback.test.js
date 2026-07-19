import test from "node:test";
import assert from "node:assert";
import { generateComplaintText } from "../src/services/gemini.service.js";

// No GEMINI_API_KEY is set in this test env, so this exercises the fallback path
// that must fire when the API is unreachable during a live demo.
test("generateComplaintText falls back gracefully without an API key", async () => {
  const result = await generateComplaintText({
    issueType: "pothole",
    severity: "high",
    address: "MG Road, Delhi",
    department: "PWD (Public Works Department)",
    reasoning: "Large deep pothole blocking traffic",
    referenceId: "CLN-TEST01",
  });
  assert.ok(result.complaint_en.includes("PWD"));
  assert.ok(result.complaint_hi.includes("CLN-TEST01"));
});
