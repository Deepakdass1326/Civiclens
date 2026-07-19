// ESM import statements are hoisted above other code, so setting process.env
// BEFORE a static import wouldn't actually take effect first. Using a dynamic
// import() here instead, since dynamic imports execute in place, in order.
import test from "node:test";
import assert from "node:assert";

process.env.ADMIN_PASSWORD = "secret123";
const { requireAdmin } = await import("../src/middlewares/requireAdmin.js");

function mockRes() {
  const res = { statusCode: 200 };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = () => {};
  return res;
}

test("requireAdmin rejects request with wrong/missing token when ADMIN_PASSWORD is set", () => {
  let nextCalled = false;
  const req = { header: () => "wrong-token" };
  const res = mockRes();
  assert.throws(() => requireAdmin(req, res, () => { nextCalled = true; }));
  assert.strictEqual(nextCalled, false);
});

test("requireAdmin allows request with correct token", () => {
  let nextCalled = false;
  const req = { header: () => "secret123" };
  const res = mockRes();
  requireAdmin(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true);
});
