import { Router } from "express";
import { createReport, listMyReports } from "../controllers/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/mine", protect, listMyReports);
router.post("/", protect, createReport);

export default router;
