import { Router } from "express";
import {
  createListing,
  deleteListing,
  getListingById,
  getMyListings,
  getPublicListings,
  updateListing,
  updateListingStatus,
} from "../controllers/listing.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { listingUpload } from "../config/cloudinary.js";

const router = Router();

router.get("/public", getPublicListings);

router.use(protect);

router.post("/", listingUpload, createListing);
router.get("/mine", getMyListings);
router.get("/:id", getListingById);
router.patch("/:id", listingUpload, updateListing);
router.patch("/:id/status", updateListingStatus);
router.delete("/:id", deleteListing);

export default router;
