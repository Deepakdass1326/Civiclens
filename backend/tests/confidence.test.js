import test from "node:test";
import assert from "node:assert";
import { isLowConfidence } from "../src/utils/confidence.util.js";

test("flags confidence below default threshold as low", () => {
  assert.strictEqual(isLowConfidence({ confidence: 0.3 }), true);
});

test("does not flag confidence at or above default threshold", () => {
  assert.strictEqual(isLowConfidence({ confidence: 0.55 }), false);
  assert.strictEqual(isLowConfidence({ confidence: 0.9 }), false);
});

test("respects a custom threshold", () => {
  assert.strictEqual(isLowConfidence({ confidence: 0.6 }, 0.7), true);
  assert.strictEqual(isLowConfidence({ confidence: 0.75 }, 0.7), false);
});

test("safely returns false for missing/malformed classification", () => {
  assert.strictEqual(isLowConfidence(null), false);
  assert.strictEqual(isLowConfidence({}), false);
  assert.strictEqual(isLowConfidence({ confidence: "high" }), false);
});
