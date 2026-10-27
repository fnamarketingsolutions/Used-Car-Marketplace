import { Router } from "express";
import { getPublicCmsPage } from "../controllers/adminPlatform.controller.js";

const router = Router();

router.get("/:slug", getPublicCmsPage);

export default router;
