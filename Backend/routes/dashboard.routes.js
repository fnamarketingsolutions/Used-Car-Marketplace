import { Router } from "express";
import {
  createAlert,
  createInquiry,
  createSavedSearch,
  deleteAlert,
  deleteSavedSearch,
  getAdminDashboard,
  getListingViews,
  getUserDashboard,
  listAlerts,
  listBuyerInquiries,
  listContactedSellers,
  listSavedCars,
  listSavedSearches,
  listSellerInquiries,
  saveCar,
  unsaveCar,
  updateAlert,
  updateInquiryStatus,
  updateSavedSearch,
} from "../controllers/dashboard.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getUserDashboard);
router.get("/admin", protect, authorize("admin"), getAdminDashboard);

router.get("/saved-cars", protect, listSavedCars);
router.post("/saved-cars", protect, saveCar);
router.delete("/saved-cars/:listingId", protect, unsaveCar);

router.get("/saved-searches", protect, listSavedSearches);
router.post("/saved-searches", protect, createSavedSearch);
router.patch("/saved-searches/:id", protect, updateSavedSearch);
router.delete("/saved-searches/:id", protect, deleteSavedSearch);

router.get("/contacted-sellers", protect, listContactedSellers);

router.get("/inquiries", protect, listBuyerInquiries);
router.post("/inquiries", protect, createInquiry);
router.patch("/inquiries/:id", protect, updateInquiryStatus);

router.get("/alerts", protect, listAlerts);
router.post("/alerts", protect, createAlert);
router.patch("/alerts/:id", protect, updateAlert);
router.delete("/alerts/:id", protect, deleteAlert);

router.get("/sell/inquiries", protect, listSellerInquiries);
router.get("/sell/views", protect, getListingViews);

export default router;
