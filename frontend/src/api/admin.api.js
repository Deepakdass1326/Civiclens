import axiosClient from "./axiosClient";

export const verifyAdminToken = (adminToken) =>
  axiosClient.post("/admin/verify", {}, { headers: { "x-admin-token": adminToken } });

/**
 * Attaches the stored admin token (if any) to a status-update call.
 * The token itself is just the shared secret typed into the dashboard's
 * password prompt — this is intentionally lightweight (see backend
 * requireAdmin middleware), not full session-based auth.
 */
export const updateStatusWithAuth = (id, status, adminToken) =>
  axiosClient.patch(
    `/complaints/${id}/status`,
    { status },
    { headers: adminToken ? { "x-admin-token": adminToken } : {} }
  );

export const updateVerificationWithAuth = (id, verificationStatus, verificationNote, adminToken) =>
  axiosClient.patch(
    `/complaints/${id}/verification`,
    { verificationStatus, verificationNote },
    { headers: { "x-admin-token": adminToken } }
  );
