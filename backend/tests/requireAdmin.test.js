import test from "node:test";
import assert from "node:assert";

// We need to control env.ADMIN_PASSWORD per test, so re-import fresh each time
// using dynamic import with cache-busting isn't trivial in ESM — instead we
// directly set process.env before importing, since env.js reads it at import time
// only once per process. To test both branches cleanly, we test the "unset" case
// first (module not yet loaded), then simulate the "set" case by calling the
// middleware logic with a manually constructed env override via monkey-patching.

test("requireAdmin allows request through when ADMIN_PASSWORD is not configured (dev/demo default)", async () => {
  const { requireAdmin } = await import("../src/middlewares/requireAdmin.js");
  const { env } = await import("../src/config/env.js");
  const previousPassword = env.ADMIN_PASSWORD;
  const previousNodeEnv = env.NODE_ENV;
  env.ADMIN_PASSWORD = null;
  env.NODE_ENV = "development";
  let nextCalled = false;
  const req = { header: () => null };
  const res = { status: () => res, json: () => {} };
  requireAdmin(req, res, () => { nextCalled = true; });
  env.ADMIN_PASSWORD = previousPassword;
  env.NODE_ENV = previousNodeEnv;
  assert.strictEqual(nextCalled, true);
});
