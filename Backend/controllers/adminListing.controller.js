import Listing from "../models/Listing.js";

export const removeAdminListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.status === "Removed") {
      return res.status(400).json({ message: "Listing is already removed" });
    }

    listing.statusBeforeRemoval = listing.status;
    listing.status = "Removed";
    await listing.save();
    await listing.populate("city", "name state slug");
    await listing.populate("seller", "fullName email accountStatus");

    return res.status(200).json({ message: "Listing removed", listing });
  } catch (error) {
    console.error("Admin remove listing error:", error);
    return res.status(500).json({ message: "Server error removing listing" });
  }
};

export const restoreAdminListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.status !== "Removed") {
      return res.status(400).json({ message: "Only removed listings can be restored" });
    }

    const requested = req.body?.status ? String(req.body.status) : null;
    const restoredStatus =
      requested || listing.statusBeforeRemoval || "Draft";

    const allowed = ["Draft", "Live", "Paused", "Sold", "Expired"];
    if (!allowed.includes(restoredStatus)) {
      return res.status(400).json({ message: "Invalid restore status" });
    }

    listing.status = restoredStatus;
    listing.statusBeforeRemoval = null;
    await listing.save();
    await listing.populate("city", "name state slug");
    await listing.populate("seller", "fullName email accountStatus");

    return res.status(200).json({ message: "Listing restored", listing });
  } catch (error) {
    console.error("Admin restore listing error:", error);
    return res.status(500).json({ message: "Server error restoring listing" });
  }
};

export const listAdminListings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.seller) filter.seller = req.query.seller;

    let listings = await Listing.find(filter)
      .populate("seller", "fullName email accountStatus")
      .populate("city", "name state slug")
      .sort({ updatedAt: -1 })
      .lean();

    const q = req.query.q ? String(req.query.q).trim() : "";
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      listings = listings.filter((listing) => {
        const haystack = [
          listing.make,
          listing.model,
          listing.variant,
          listing.slug,
          listing.seller?.fullName,
          listing.seller?.email,
          listing.city?.name,
          listing.city?.state,
        ]
          .filter(Boolean)
          .join(" ");
        return regex.test(haystack);
      });
    }

    const uniqueSellerObjectIds = [
      ...new Map(
        listings
          .map((item) => item.seller?._id)
          .filter(Boolean)
          .map((id) => [String(id), id])
      ).values(),
    ];

    const sellerCounts =
      uniqueSellerObjectIds.length === 0
        ? []
        : await Listing.aggregate([
            { $match: { seller: { $in: uniqueSellerObjectIds } } },
            { $group: { _id: "$seller", total: { $sum: 1 } } },
          ]);

    const countBySeller = Object.fromEntries(
      sellerCounts.map((row) => [String(row._id), row.total])
    );

    const enriched = listings.map((listing) => {
      const sellerKey = String(listing.seller?._id || listing.seller || "");
      return {
        ...listing,
        sellerListingCount: countBySeller[sellerKey] || 0,
      };
    });

    return res.status(200).json({ listings: enriched });
  } catch (error) {
    console.error("Admin list listings error:", error);
    return res.status(500).json({ message: "Server error listing listings" });
  }
};

export const getAdminListingDetail = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("seller", "fullName email phoneNumber accountStatus role createdAt")
      .populate("city", "name state slug");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const sellerId = listing.seller?._id || listing.seller;
    const sellerListings = await Listing.find({ seller: sellerId }).select("status");

    const listingStats = {
      total: sellerListings.length,
      live: sellerListings.filter((l) => l.status === "Live").length,
      paused: sellerListings.filter((l) => l.status === "Paused").length,
      sold: sellerListings.filter((l) => l.status === "Sold").length,
      draft: sellerListings.filter((l) => l.status === "Draft").length,
      removed: sellerListings.filter((l) => l.status === "Removed").length,
    };

    const seller = listing.seller
      ? {
          id: listing.seller._id,
          fullName: listing.seller.fullName,
          email: listing.seller.email,
          phoneNumber: listing.seller.phoneNumber,
          role: listing.seller.role,
          accountStatus: listing.seller.accountStatus,
          createdAt: listing.seller.createdAt,
        }
      : null;

    return res.status(200).json({
      listing,
      seller,
      listingStats,
    });
  } catch (error) {
    console.error("Admin get listing detail error:", error);
    return res.status(500).json({ message: "Server error fetching listing" });
  }
};
