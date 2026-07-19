import { Router } from "express";
import { verifyAdmin } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { writeLimiter } from "../middlewares/rateLimiters.js";

const router = Router();

router.post("/verify", writeLimiter, requireAdmin, verifyAdmin);

export default router;

