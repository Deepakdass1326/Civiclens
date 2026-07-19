import test from "node:test";
import assert from "node:assert/strict";
import { buildEvidenceFlags, hashEvidence } from "../src/utils/evidence.util.js";

test("hashEvidence is stable for the same image and changes for different images", () => {
  assert.equal(hashEvidence("ZmFrZQ=="), hashEvidence("ZmFrZQ=="));
  assert.notEqual(hashEvidence("ZmFrZQ=="), hashEvidence("b3RoZXI="));
  assert.equal(hashEvidence(null), null);
});

test("buildEvidenceFlags identifies missing photo and low AI confidence", () => {
  assert.deepEqual(buildEvidenceFlags({ imageBase64: null, confidence: 0.4 }), ["no_photo", "low_ai_confidence"]);
  assert.deepEqual(buildEvidenceFlags({ imageBase64: "ZmFrZQ==", confidence: 0.8 }), []);
});

