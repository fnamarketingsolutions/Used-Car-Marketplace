import { Router } from "express";
import {
  byCity,
  byState,
  getVehicleBySlug,
} from "../controllers/usedCars.controller.js";
import { optionalProtect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/by-state/:stateSlug", byState);
router.get("/by-city/:citySlug", byCity);
router.get(
  "/:make/:model/:year/:listingSlug",
  optionalProtect,
  getVehicleBySlug
);

export default router;
