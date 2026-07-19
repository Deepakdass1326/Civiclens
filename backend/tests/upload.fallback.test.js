import test from "node:test";
import assert from "node:assert";
import { uploadComplaintPhoto, isCloudinaryConfigured } from "../src/services/upload.service.js";

// No CLOUDINARY_* env vars set in this test environment — exercises the
// fail-safe path that must never crash complaint submission.
test("uploadComplaintPhoto returns null gracefully when Cloudinary isn't configured", async (t) => {
  if (isCloudinaryConfigured) {
    t.skip("Cloudinary credentials are configured in the local environment");
    return;
  }
  const url = await uploadComplaintPhoto("ZmFrZWJhc2U2NGRhdGE=", "image/jpeg");
  assert.strictEqual(url, null);
});
