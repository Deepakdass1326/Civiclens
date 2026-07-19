import { Complaint } from "../models/Complaint.model.js";

const DEFAULT_RADIUS_METERS = 50;

/**
 * Finds an existing, unresolved complaint of the same issue type within `radiusMeters`
 * of the given coordinates. Returns null if none found (i.e. this is a genuinely new issue).
 *
 * @param {number} lng
 * @param {number} lat
 * @param {string} issueType
 * @param {number} radiusMeters
 */
export async function findNearbyDuplicate(lng, lat, issueType, radiusMeters = DEFAULT_RADIUS_METERS) {
  return Complaint.findOne({
    issueType,
    status: { $ne: "resolved" },
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusMeters,
      },
    },
  });
}

/**
 * Adds a new supporter to an existing complaint and bumps its reportCount.
 * Caller is responsible for recomputing impactScore afterward.
 */
export async function addSupporter(complaintId, supporter = {}) {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) return null;

  complaint.supporters.push({
    name: supporter.name || "Anonymous",
    contact: supporter.contact || null,
    reportedAt: new Date(),
  });
  complaint.reportCount = (complaint.reportCount || 1) + 1;
  await complaint.save();
  return complaint;
}
