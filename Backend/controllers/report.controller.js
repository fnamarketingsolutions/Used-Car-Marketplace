import Report from "../models/Report.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";

const LISTING_POPULATE =
  "make model variant bodyType manufacturingYear slug status";

export const createReport = async (req, res) => {
  try {
    const { targetType, listingId, userId, reason, details, category } = req.body;

    if (!["listing", "user"].includes(targetType)) {
      return res.status(400).json({ message: "targetType must be listing or user" });
    }
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const allowedCategories = ["spam", "fraud", "inappropriate", "other"];
    const normalizedCategory = allowedCategories.includes(category)
      ? category
      : "other";

    const payload = {
      reporter: req.user._id,
      targetType,
      reason: String(reason).trim(),
      details: details ? String(details).trim() : "",
      category: normalizedCategory,
    };

    if (targetType === "listing") {
      if (!listingId) {
        return res.status(400).json({ message: "listingId is required" });
      }
      const listing = await Listing.findById(listingId);
      if (!listing || listing.status === "Removed") {
        return res.status(404).json({ message: "Listing not found" });
      }
      if (String(listing.seller) === String(req.user._id)) {
        return res.status(400).json({ message: "You cannot report your own listing" });
      }

      const existing = await Report.findOne({
        reporter: req.user._id,
        targetType: "listing",
        listing: listing._id,
        status: "pending",
      });
      if (existing) {
        return res.status(409).json({
          message: "You already have a pending report for this listing",
        });
      }

      payload.listing = listing._id;
      payload.reportedUser = listing.seller;
    } else {
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      if (String(userId) === String(req.user._id)) {
        return res.status(400).json({ message: "You cannot report yourself" });
      }
      const user = await User.findById(userId);
      if (!user || user.role === "admin") {
        return res.status(404).json({ message: "User not found" });
      }
      payload.reportedUser = user._id;
    }

    const report = await Report.create(payload);
    return res.status(201).json({ message: "Report submitted", report });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({ message: "Server error creating report" });
  }
};

export const listMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate("reportedUser", "fullName email accountStatus")
      .populate("listing", LISTING_POPULATE)
      .populate("reviewedBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ reports });
  } catch (error) {
    console.error("List my reports error:", error);
    return res.status(500).json({ message: "Server error listing your reports" });
  }
};

export const listReports = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.targetType) filter.targetType = req.query.targetType;

    const reports = await Report.find(filter)
      .populate("reporter", "fullName email")
      .populate("reportedUser", "fullName email accountStatus")
      .populate("listing", LISTING_POPULATE)
      .populate("reviewedBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ reports });
  } catch (error) {
    console.error("List reports error:", error);
    return res.status(500).json({ message: "Server error listing reports" });
  }
};

export const reviewReport = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!["reviewed", "actioned", "dismissed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be reviewed, actioned, or dismissed",
      });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = status;
    if (adminNote !== undefined) report.adminNote = String(adminNote).trim();
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    return res.status(200).json({ message: "Report updated", report });
  } catch (error) {
    console.error("Review report error:", error);
    return res.status(500).json({ message: "Server error reviewing report" });
  }
};
