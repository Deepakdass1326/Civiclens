import { env } from "../config/env.js";

const FORWARD_TIMEOUT_MS = 5000;

export async function forwardComplaint(complaint) {
  if (!env.FORWARDING_WEBHOOK_URL) {
    return { status: "not_configured", externalReference: null };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS);

  try {
    const response = await fetch(env.FORWARDING_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        event: "civiclens.complaint.created",
        complaint: {
          id: complaint._id,
          referenceId: complaint.referenceId,
          issueType: complaint.issueType,
          severity: complaint.severity,
          impactScore: complaint.impactScore,
          department: complaint.department,
          address: complaint.address,
          ward: complaint.ward,
          location: complaint.location,
          complaintTextEn: complaint.complaintTextEn,
          complaintTextHi: complaint.complaintTextHi,
          source: complaint.source,
        },
      }),
    });

    if (!response.ok) throw new Error(`Forwarding service responded ${response.status}`);
    let externalReference = null;
    try {
      const data = await response.json();
      externalReference = data.referenceId || data.ticketId || null;
    } catch {
      // A 2xx response without JSON is still a successful handoff.
    }
    return { status: "sent", externalReference };
  } catch (error) {
    console.warn("[forwarding] complaint handoff failed:", error.message);
    return { status: "failed", externalReference: null };
  } finally {
    clearTimeout(timeout);
  }
}

