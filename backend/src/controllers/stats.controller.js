import asyncHandler from "express-async-handler";
import { Complaint } from "../models/Complaint.model.js";

/**
 * GET /api/stats/summary
 * Powers the dashboard stat cards + department bar chart.
 */
export const getSummary = asyncHandler(async (req, res) => {
  const sourceFilter = req.query.source === "real"
    ? { source: { $ne: "demo_seed" } }
    : req.query.source
      ? { source: req.query.source }
      : {};
  const [total, pending, inProgress, resolved, critical, verified, sourceBreakdown] = await Promise.all([
    Complaint.countDocuments(sourceFilter),
    Complaint.countDocuments({ ...sourceFilter, status: "pending" }),
    Complaint.countDocuments({ ...sourceFilter, status: "in_progress" }),
    Complaint.countDocuments({ ...sourceFilter, status: "resolved" }),
    Complaint.countDocuments({ ...sourceFilter, impactBand: "Critical", status: { $ne: "resolved" } }),
    Complaint.countDocuments({ ...sourceFilter, verificationStatus: { $in: ["field_verified", "authority_verified"] } }),
    Complaint.aggregate([
      { $match: sourceFilter },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const byDepartment = await Complaint.aggregate([
    { $match: sourceFilter },
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    summary: {
      total,
      pending,
      inProgress,
      resolved,
      criticalZones: critical,
      verified,
      resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
      bySource: sourceBreakdown.map((item) => ({ source: item._id, count: item.count })),
      byDepartment: byDepartment.map((d) => ({ department: d._id, count: d.count })),
    },
  });
});

/**
 * GET /api/stats/heatmap
 * Returns lightweight [lat, lng, weight] points for the Leaflet heatmap layer.
 */
export const getHeatmapData = asyncHandler(async (req, res) => {
  const sourceFilter = req.query.source === "real"
    ? { source: { $ne: "demo_seed" } }
    : req.query.source
      ? { source: req.query.source }
      : {};
  const complaints = await Complaint.find({ ...sourceFilter, status: { $ne: "resolved" } }, "location impactScore");
  const points = complaints.map((c) => [
    c.location.coordinates[1], // lat
    c.location.coordinates[0], // lng
    Math.max(c.impactScore, 0.1), // weight, floor to keep faint points visible
  ]);
  res.json({ success: true, points });
});
