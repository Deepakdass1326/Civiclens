import { Router } from "express";
import complaintRoutes from "./complaint.routes.js";
import statsRoutes from "./stats.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.use("/complaints", complaintRoutes);
router.use("/stats", statsRoutes);
router.use("/admin", adminRoutes);

export default router;
