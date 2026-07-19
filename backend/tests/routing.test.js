import test from "node:test";
import assert from "node:assert";
import { routeToDepartment, ROUTING_TABLE } from "../src/services/routing.service.js";

test("routes every known issue type to a non-empty department", () => {
  for (const type of Object.keys(ROUTING_TABLE)) {
    assert.ok(routeToDepartment(type).length > 0);
  }
});

test("pothole routes to PWD", () => {
  assert.strictEqual(routeToDepartment("pothole"), "PWD (Public Works Department)");
});

test("water_leakage routes to Jal Board", () => {
  assert.match(routeToDepartment("water_leakage"), /Jal Board/);
});

test("unknown issue type falls back to General Municipal Helpline", () => {
  assert.strictEqual(routeToDepartment("something_weird"), "General Municipal Helpline");
});
