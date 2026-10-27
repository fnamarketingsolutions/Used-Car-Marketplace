import { Router } from "express";
import {
  createState,
  deleteState,
  listStateRequests,
  listStates,
  requestState,
  reviewStateRequest,
  updateState,
} from "../controllers/state.controller.js";
import { authorize, optionalProtect, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", optionalProtect, listStates);
router.post("/request", protect, requestState);

router.get("/requests", protect, authorize("admin"), listStateRequests);
router.patch("/requests/:id", protect, authorize("admin"), reviewStateRequest);

router.post("/", protect, authorize("admin"), createState);
router.patch("/:id", protect, authorize("admin"), updateState);
router.delete("/:id", protect, authorize("admin"), deleteState);

export default router;
