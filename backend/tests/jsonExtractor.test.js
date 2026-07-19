import test from "node:test";
import assert from "node:assert";
import { extractJson, JsonExtractionError } from "../src/utils/jsonExtractor.util.js";

test("parses clean JSON directly", () => {
  const result = extractJson('{"issue_type":"pothole","severity":"high"}');
  assert.strictEqual(result.issue_type, "pothole");
});

test("strips markdown fences (```json ... ```)", () => {
  const raw = "```json\n{\"issue_type\":\"garbage\",\"severity\":\"medium\"}\n```";
  const result = extractJson(raw);
  assert.strictEqual(result.severity, "medium");
});

test("extracts JSON even with stray prose around it", () => {
  const raw = "Sure, here is the analysis:\n{\"issue_type\":\"fallen_tree\",\"severity\":\"critical\"}\nLet me know if you need more.";
  const result = extractJson(raw);
  assert.strictEqual(result.issue_type, "fallen_tree");
});

test("throws JsonExtractionError on totally broken input", () => {
  assert.throws(() => extractJson("not json at all, sorry"), JsonExtractionError);
});

test("throws on empty input", () => {
  assert.throws(() => extractJson(""), JsonExtractionError);
});
