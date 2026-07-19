import { env } from "../config/env.js";

/**
 * Lightweight admin gate for mutating dashboard actions (status updates).
 * This is deliberately a simple shared-secret header check, NOT full auth
 * (no sessions, no per-user identity) — appropriate for a hackathon/pilot
 * "authority dashboard" where the goal is keeping random citizens from
 * changing complaint status, not enterprise-grade access control.
 *
 * If ADMIN_PASSWORD is not configured, the gate is open (fails safe for
 * local dev/demo) but logs a warning so it's never silently insecure.
 */
export function requireAdmin(req, res, next) {
  if (!env.ADMIN_PASSWORD && env.NODE_ENV !== "production") {
    console.warn("[auth] ADMIN_PASSWORD not set — admin routes are UNPROTECTED.");
    return next();
  }

  if (!env.ADMIN_PASSWORD) {
    res.status(503);
    throw new Error("Admin authentication is not configured");
  }

  const token = req.header("x-admin-token");
  if (token !== env.ADMIN_PASSWORD) {
    res.status(401);
    throw new Error("Unauthorized — valid x-admin-token header required");
  }
  next();
}
