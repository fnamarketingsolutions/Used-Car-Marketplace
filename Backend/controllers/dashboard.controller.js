import Listing from "../models/Listing.js";
import SavedListing from "../models/SavedListing.js";
import SavedSearch from "../models/SavedSearch.js";
import Inquiry from "../models/Inquiry.js";
import Alert from "../models/Alert.js";
import User from "../models/User.js";
import Report from "../models/Report.js";
import CityRequest from "../models/CityRequest.js";
import StateRequest from "../models/StateRequest.js";
import {
  INQUIRY_LISTING_POPULATE,
  activityForStatus,
  serializeInquiry,
} from "../utils/listingPublic.js";

export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      myListings,
      savedCarsCount,
      savedSearchesCount,
      buyerInquiries,
      sellerInquiries,
      alertsCount,
      contactedSellerIds,
    ] = await Promise.all([
      Listing.find({ seller: userId }).select("status viewCount"),
      SavedListing.countDocuments({ user: userId }),
      SavedSearch.countDocuments({ user: userId }),
      Inquiry.find({ buyer: userId })
        .populate("listing", INQUIRY_LISTING_POPULATE)
        .populate("seller", "fullName phoneNumber email privacySettings")
        .populate("buyer", "fullName")
        .sort({ updatedAt: -1 })
        .limit(10),
      Inquiry.find({ seller: userId })
        .populate("listing", INQUIRY_LISTING_POPULATE)
        .populate("buyer", "fullName email phoneNumber")
        .populate("seller", "fullName")
        .sort({ updatedAt: -1 })
        .limit(10),
      Alert.countDocuments({ user: userId, isActive: true }),
      Inquiry.distinct("seller", { buyer: userId }),
    ]);

    const sellSummary = {
      total: myListings.length,
      active: myListings.filter((l) => l.status === "Live").length,
      paused: myListings.filter((l) => l.status === "Paused").length,
      sold: myListings.filter((l) => l.status === "Sold").length,
      draft: myListings.filter((l) => l.status === "Draft").length,
      totalViews: myListings.reduce((sum, l) => sum + (l.viewCount || 0), 0),
    };

    return res.status(200).json({
      message: "Dashboard access granted",
      user: req.user.toSafeObject(),
      buy: {
        savedCarsCount,
        savedSearchesCount,
        contactedSellersCount: contactedSellerIds.length,
        inquiriesCount: buyerInquiries.length,
        alertsCount,
        recentInquiries: buyerInquiries.map((inquiry) =>
          serializeInquiry(inquiry, { viewerRole: "buyer" })
        ),
      },
      sell: {
        ...sellSummary,
        recentBuyerInquiries: sellerInquiries.map((inquiry) =>
          serializeInquiry(inquiry, { viewerRole: "seller" })
        ),
      },
    });
  } catch (error) {
    console.error("User dashboard error:", error);
    return res.status(500).json({ message: "Server error loading dashboard" });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const [
      usersCount,
      listingsByStatus,
      pendingReports,
      pendingCityRequests,
      pendingStateRequests,
      totalViewsAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Listing.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Report.countDocuments({ status: "pending" }),
      CityRequest.countDocuments({ status: "pending" }),
      StateRequest.countDocuments({ status: "pending" }),
      Listing.aggregate([
        { $group: { _id: null, totalViews: { $sum: "$viewCount" } } },
      ]),
    ]);

    const statusMap = Object.fromEntries(
      listingsByStatus.map((row) => [row._id, row.count])
    );

    return res.status(200).json({
      message: "Admin dashboard access granted",
      user: req.user.toSafeObject(),
      analytics: {
        usersCount,
        listingsByStatus: statusMap,
        pendingReports,
        pendingCityRequests,
        pendingStateRequests,
        totalViews: totalViewsAgg[0]?.totalViews || 0,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ message: "Server error loading admin dashboard" });
  }
};

export const listSavedCars = async (req, res) => {
  try {
    const items = await SavedListing.find({ user: req.user._id })
      .populate({
        path: "listing",
        populate: { path: "city", select: "name state slug" },
      })
      .sort({ createdAt: -1 });
    return res.status(200).json({ savedCars: items });
  } catch (error) {
    console.error("List saved cars error:", error);
    return res.status(500).json({ message: "Server error fetching saved cars" });
  }
};

export const saveCar = async (req, res) => {
  try {
    const { listingId } = req.body;
    if (!listingId) {
      return res.status(400).json({ message: "listingId is required" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing || listing.status === "Removed") {
      return res.status(404).json({ message: "Listing not found" });
    }

    const item = await SavedListing.findOneAndUpdate(
      { user: req.user._id, listing: listingId },
      { user: req.user._id, listing: listingId },
      { upsert: true, returnDocument: "after" }
    ).populate("listing");

    return res.status(201).json({ message: "Car saved", savedCar: item });
  } catch (error) {
    console.error("Save car error:", error);
    return res.status(500).json({ message: "Server error saving car" });
  }
};

export const unsaveCar = async (req, res) => {
  try {
    const deleted = await SavedListing.findOneAndDelete({
      user: req.user._id,
      listing: req.params.listingId,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Saved car not found" });
    }
    return res.status(200).json({ message: "Removed from saved cars" });
  } catch (error) {
    console.error("Unsave car error:", error);
    return res.status(500).json({ message: "Server error removing saved car" });
  }
};

export const listSavedSearches = async (req, res) => {
  try {
    const searches = await SavedSearch.find({ user: req.user._id }).sort({
      updatedAt: -1,
    });
    return res.status(200).json({ savedSearches: searches });
  } catch (error) {
    console.error("List saved searches error:", error);
    return res.status(500).json({ message: "Server error fetching saved searches" });
  }
};

export const createSavedSearch = async (req, res) => {
  try {
    const { name, filters } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const search = await SavedSearch.create({
      user: req.user._id,
      name: String(name).trim(),
      filters: filters || {},
    });
    return res.status(201).json({ message: "Saved search created", savedSearch: search });
  } catch (error) {
    console.error("Create saved search error:", error);
    return res.status(500).json({ message: "Server error creating saved search" });
  }
};

export const updateSavedSearch = async (req, res) => {
  try {
    const search = await SavedSearch.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!search) {
      return res.status(404).json({ message: "Saved search not found" });
    }
    if (req.body.name !== undefined) search.name = String(req.body.name).trim();
    if (req.body.filters !== undefined) search.filters = req.body.filters;
    await search.save();
    return res.status(200).json({ message: "Saved search updated", savedSearch: search });
  } catch (error) {
    console.error("Update saved search error:", error);
    return res.status(500).json({ message: "Server error updating saved search" });
  }
};

export const deleteSavedSearch = async (req, res) => {
  try {
    const deleted = await SavedSearch.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Saved search not found" });
    }
    return res.status(200).json({ message: "Saved search deleted" });
  } catch (error) {
    console.error("Delete saved search error:", error);
    return res.status(500).json({ message: "Server error deleting saved search" });
  }
};

export const listContactedSellers = async (req, res) => {
  try {
    const sellerIds = await Inquiry.distinct("seller", { buyer: req.user._id });
    const sellers = await User.find({ _id: { $in: sellerIds } }).select(
      "fullName email phoneNumber privacySettings"
    );
    return res.status(200).json({ contactedSellers: sellers });
  } catch (error) {
    console.error("List contacted sellers error:", error);
    return res.status(500).json({ message: "Server error fetching contacted sellers" });
  }
};

export const listBuyerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ buyer: req.user._id })
      .populate("listing", INQUIRY_LISTING_POPULATE)
      .populate("seller", "fullName phoneNumber email privacySettings")
      .populate("buyer", "fullName")
      .sort({ updatedAt: -1 });
    return res.status(200).json({
      inquiries: inquiries.map((inquiry) =>
        serializeInquiry(inquiry, { viewerRole: "buyer" })
      ),
    });
  } catch (error) {
    console.error("List buyer inquiries error:", error);
    return res.status(500).json({ message: "Server error fetching inquiries" });
  }
};

export const createInquiry = async (req, res) => {
  try {
    const { listingId, message } = req.body;
    if (!listingId || !message || !String(message).trim()) {
      return res.status(400).json({ message: "listingId and message are required" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing || listing.status !== "Live") {
      return res.status(404).json({ message: "Live listing not found" });
    }
    if (String(listing.seller) === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot inquire on your own listing" });
    }

    const inquiry = await Inquiry.create({
      buyer: req.user._id,
      seller: listing.seller,
      listing: listing._id,
      message: String(message).trim(),
      contactActivity: [{ action: "inquiry_sent", at: new Date() }],
    });

    await inquiry.populate("listing", INQUIRY_LISTING_POPULATE);
    await inquiry.populate("seller", "fullName phoneNumber email privacySettings");
    await inquiry.populate("buyer", "fullName");

    return res.status(201).json({
      message: "Inquiry sent",
      inquiry: serializeInquiry(inquiry, { viewerRole: "buyer" }),
    });
  } catch (error) {
    console.error("Create inquiry error:", error);
    return res.status(500).json({ message: "Server error creating inquiry" });
  }
};

export const listSellerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ seller: req.user._id })
      .populate("listing", INQUIRY_LISTING_POPULATE)
      .populate("buyer", "fullName email phoneNumber")
      .populate("seller", "fullName")
      .sort({ updatedAt: -1 });
    return res.status(200).json({
      inquiries: inquiries.map((inquiry) =>
        serializeInquiry(inquiry, { viewerRole: "seller" })
      ),
    });
  } catch (error) {
    console.error("List seller inquiries error:", error);
    return res.status(500).json({ message: "Server error fetching seller inquiries" });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["open", "replied", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid inquiry status" });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    const isSeller = String(inquiry.seller) === String(req.user._id);
    const isBuyer = String(inquiry.buyer) === String(req.user._id);
    if (!isSeller && !isBuyer && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    inquiry.status = status;
    const activityAction = activityForStatus(status);
    if (activityAction) {
      inquiry.contactActivity.push({ action: activityAction, at: new Date() });
    }
    await inquiry.save();

    await inquiry.populate("listing", INQUIRY_LISTING_POPULATE);
    await inquiry.populate("buyer", "fullName email phoneNumber");
    await inquiry.populate(
      "seller",
      "fullName phoneNumber email privacySettings"
    );

    const viewerRole = isSeller ? "seller" : isBuyer ? "buyer" : "admin";

    return res.status(200).json({
      message: "Inquiry updated",
      inquiry: serializeInquiry(inquiry, { viewerRole }),
    });
  } catch (error) {
    console.error("Update inquiry error:", error);
    return res.status(500).json({ message: "Server error updating inquiry" });
  }
};

export const listAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).sort({ updatedAt: -1 });
    return res.status(200).json({ alerts });
  } catch (error) {
    console.error("List alerts error:", error);
    return res.status(500).json({ message: "Server error fetching alerts" });
  }
};

export const createAlert = async (req, res) => {
  try {
    const { name, filters, isActive } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const alert = await Alert.create({
      user: req.user._id,
      name: String(name).trim(),
      filters: filters || {},
      isActive: isActive === undefined ? true : Boolean(isActive),
    });
    return res.status(201).json({ message: "Alert created", alert });
  } catch (error) {
    console.error("Create alert error:", error);
    return res.status(500).json({ message: "Server error creating alert" });
  }
};

export const updateAlert = async (req, res) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, user: req.user._id });
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    if (req.body.name !== undefined) alert.name = String(req.body.name).trim();
    if (req.body.filters !== undefined) alert.filters = req.body.filters;
    if (req.body.isActive !== undefined) alert.isActive = Boolean(req.body.isActive);
    await alert.save();
    return res.status(200).json({ message: "Alert updated", alert });
  } catch (error) {
    console.error("Update alert error:", error);
    return res.status(500).json({ message: "Server error updating alert" });
  }
};

export const deleteAlert = async (req, res) => {
  try {
    const deleted = await Alert.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Alert not found" });
    }
    return res.status(200).json({ message: "Alert deleted" });
  } catch (error) {
    console.error("Delete alert error:", error);
    return res.status(500).json({ message: "Server error deleting alert" });
  }
};

export const getListingViews = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .select("variant bodyType manufacturingYear status slug viewCount updatedAt")
      .sort({ viewCount: -1 });
    return res.status(200).json({ listings });
  } catch (error) {
    console.error("Listing views error:", error);
    return res.status(500).json({ message: "Server error fetching listing views" });
  }
};
