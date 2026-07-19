import { Router } from "express";
import { getSummary, getHeatmapData } from "../controllers/stats.controller.js";

const router = Router();

router.get("/summary", getSummary);
router.get("/heatmap", getHeatmapData);

export default router;
