import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { writeLimiter, readLimiter } from "../middlewares/rateLimiters.js";
import {
  classify,
  createComplaint,
  supportComplaint,
  listComplaints,
  getComplaint,
  updateStatus,
  updateVerification,
} from "../controllers/complaint.controller.js";

const router = Router();

router.post("/classify", writeLimiter, classify);
router.post("/", writeLimiter, createComplaint);
router.get("/", readLimiter, listComplaints);
router.get("/:id", readLimiter, getComplaint);
router.post("/:id/support", writeLimiter, supportComplaint);
router.patch("/:id/status", writeLimiter, requireAdmin, updateStatus);
router.patch("/:id/verification", writeLimiter, requireAdmin, updateVerification);

export default router;
