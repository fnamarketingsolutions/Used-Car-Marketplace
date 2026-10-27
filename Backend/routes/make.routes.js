import { Router } from "express";
import {
  createMake,
  deleteMake,
  listMakes,
  updateMake,
} from "../controllers/make.controller.js";
import {
  authorize,
  optionalProtect,
  protect,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", optionalProtect, listMakes);
router.post("/", protect, authorize("admin"), createMake);
router.patch("/:id", protect, authorize("admin"), updateMake);
router.delete("/:id", protect, authorize("admin"), deleteMake);

export default router;
