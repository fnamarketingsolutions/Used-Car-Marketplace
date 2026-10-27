import { Router } from "express";
import {
  createModel,
  deleteModel,
  listModels,
  updateModel,
} from "../controllers/model.controller.js";
import {
  authorize,
  optionalProtect,
  protect,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", optionalProtect, listModels);
router.post("/", protect, authorize("admin"), createModel);
router.patch("/:id", protect, authorize("admin"), updateModel);
router.delete("/:id", protect, authorize("admin"), deleteModel);

export default router;
