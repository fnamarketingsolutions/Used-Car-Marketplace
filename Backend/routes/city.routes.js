import { Router } from "express";
import {
  createCity,
  deleteCity,
  listCities,
  listCityRequests,
  listMyCityRequests,
  requestCity,
  reviewCityRequest,
  updateCity,
} from "../controllers/city.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, listCities);
router.post("/request", protect, requestCity);

router.get("/requests/mine", protect, listMyCityRequests);
router.get("/requests", protect, authorize("admin"), listCityRequests);
router.patch("/requests/:id", protect, authorize("admin"), reviewCityRequest);

router.post("/", protect, authorize("admin"), createCity);
router.patch("/:id", protect, authorize("admin"), updateCity);
router.delete("/:id", protect, authorize("admin"), deleteCity);

export default router;
