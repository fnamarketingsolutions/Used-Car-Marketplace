import { Router } from "express";
import {
  blockUser,
  getUserById,
  listUsers,
  suspendUser,
  unblockUser,
  unsuspendUser,
  warnUser,
} from "../controllers/adminUser.controller.js";
import {
  getAdminListingDetail,
  listAdminListings,
  removeAdminListing,
  restoreAdminListing,
} from "../controllers/adminListing.controller.js";
import { listReports, reviewReport } from "../controllers/report.controller.js";
import {
  createCmsPage,
  deleteCmsPage,
  getAnalytics,
  getPlatformSettings,
  listCmsPages,
  updateCmsPage,
  updatePlatformSettings,
} from "../controllers/adminPlatform.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/users", listUsers);
router.get("/users/:id", getUserById);
router.post("/users/:id/warn", warnUser);
router.post("/users/:id/suspend", suspendUser);
router.post("/users/:id/unsuspend", unsuspendUser);
router.post("/users/:id/block", blockUser);
router.post("/users/:id/unblock", unblockUser);

router.get("/listings", listAdminListings);
router.get("/listings/:id", getAdminListingDetail);
router.post("/listings/:id/remove", removeAdminListing);
router.post("/listings/:id/restore", restoreAdminListing);

router.get("/reports", listReports);
router.patch("/reports/:id", reviewReport);

router.get("/analytics", getAnalytics);
router.get("/settings", getPlatformSettings);
router.patch("/settings", updatePlatformSettings);

router.get("/cms", listCmsPages);
router.post("/cms", createCmsPage);
router.patch("/cms/:id", updateCmsPage);
router.delete("/cms/:id", deleteCmsPage);

export default router;
