import test from "node:test";
import assert from "node:assert";
import { appendStatusHistory, shouldRecordStatusChange } from "../src/utils/statusHistory.util.js";

test("appendStatusHistory adds a new entry without mutating the original array", () => {
  const original = [{ status: "pending", changedAt: new Date("2026-01-01") }];
  const updated = appendStatusHistory(original, "in_progress", new Date("2026-01-02"));
  assert.strictEqual(original.length, 1, "original array must not be mutated");
  assert.strictEqual(updated.length, 2);
  assert.strictEqual(updated[1].status, "in_progress");
});

test("appendStatusHistory works from an empty history", () => {
  const updated = appendStatusHistory([], "pending");
  assert.strictEqual(updated.length, 1);
  assert.strictEqual(updated[0].status, "pending");
});

test("shouldRecordStatusChange returns false for a no-op status change", () => {
  const history = [{ status: "resolved", changedAt: new Date() }];
  assert.strictEqual(shouldRecordStatusChange(history, "resolved"), false);
});

test("shouldRecordStatusChange returns true for a genuine transition", () => {
  const history = [{ status: "pending", changedAt: new Date() }];
  assert.strictEqual(shouldRecordStatusChange(history, "in_progress"), true);
});

test("shouldRecordStatusChange returns true when history is empty", () => {
  assert.strictEqual(shouldRecordStatusChange([], "pending"), true);
});
