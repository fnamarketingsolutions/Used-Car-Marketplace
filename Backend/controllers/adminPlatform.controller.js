import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Report from "../models/Report.js";
import PlatformSetting from "../models/PlatformSetting.js";
import CmsPage from "../models/CmsPage.js";
import { slugify, uniqueSlug } from "../utils/slugify.js";

export const getAnalytics = async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    const dateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from && !Number.isNaN(from.getTime())) dateFilter.createdAt.$gte = from;
      if (to && !Number.isNaN(to.getTime())) dateFilter.createdAt.$lte = to;
    }

    const [
      usersCount,
      newUsers,
      listingsByStatus,
      newListings,
      pendingReports,
      spamReports,
      fraudReports,
      totalViewsAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", ...dateFilter }),
      Listing.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Listing.countDocuments(dateFilter),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ category: "spam", ...dateFilter }),
      Report.countDocuments({ category: "fraud", ...dateFilter }),
      Listing.aggregate([
        { $group: { _id: null, totalViews: { $sum: "$viewCount" } } },
      ]),
    ]);

    return res.status(200).json({
      analytics: {
        usersCount,
        newUsers,
        listingsByStatus: Object.fromEntries(
          listingsByStatus.map((row) => [row._id, row.count])
        ),
        newListings,
        pendingReports,
        spamReports,
        fraudReports,
        totalViews: totalViewsAgg[0]?.totalViews || 0,
        range: { from: from || null, to: to || null },
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ message: "Server error fetching analytics" });
  }
};

const getOrCreateSettings = async () => {
  let settings = await PlatformSetting.findOne({ key: "default" });
  if (!settings) {
    settings = await PlatformSetting.create({ key: "default" });
  }
  return settings;
};

export const getPlatformSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({ settings });
  } catch (error) {
    console.error("Get platform settings error:", error);
    return res.status(500).json({ message: "Server error fetching settings" });
  }
};

export const updatePlatformSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const fields = [
      "siteName",
      "supportEmail",
      "supportPhone",
      "allowRegistration",
      "maxPhotosPerListing",
      "maintenanceMode",
      "extra",
    ];

    for (const key of fields) {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    }

    await settings.save();
    return res.status(200).json({ message: "Settings updated", settings });
  } catch (error) {
    console.error("Update platform settings error:", error);
    return res.status(500).json({ message: "Server error updating settings" });
  }
};

export const listCmsPages = async (req, res) => {
  try {
    const pages = await CmsPage.find().sort({ updatedAt: -1 });
    return res.status(200).json({ pages });
  } catch (error) {
    console.error("List CMS pages error:", error);
    return res.status(500).json({ message: "Server error fetching CMS pages" });
  }
};

export const createCmsPage = async (req, res) => {
  try {
    const { title, body, isPublished, slug } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const pageSlug = slug
      ? slugify(slug)
      : await uniqueSlug(CmsPage, title);

    const page = await CmsPage.create({
      title: String(title).trim(),
      slug: pageSlug,
      body: body || "",
      isPublished: Boolean(isPublished),
    });

    return res.status(201).json({ message: "CMS page created", page });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "CMS slug already exists" });
    }
    console.error("Create CMS page error:", error);
    return res.status(500).json({ message: "Server error creating CMS page" });
  }
};

export const updateCmsPage = async (req, res) => {
  try {
    const page = await CmsPage.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: "CMS page not found" });
    }

    if (req.body.title !== undefined) page.title = String(req.body.title).trim();
    if (req.body.body !== undefined) page.body = req.body.body;
    if (req.body.isPublished !== undefined) {
      page.isPublished = Boolean(req.body.isPublished);
    }
    if (req.body.slug !== undefined) page.slug = slugify(req.body.slug);

    await page.save();
    return res.status(200).json({ message: "CMS page updated", page });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "CMS slug already exists" });
    }
    console.error("Update CMS page error:", error);
    return res.status(500).json({ message: "Server error updating CMS page" });
  }
};

export const deleteCmsPage = async (req, res) => {
  try {
    const page = await CmsPage.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ message: "CMS page not found" });
    }
    return res.status(200).json({ message: "CMS page deleted" });
  } catch (error) {
    console.error("Delete CMS page error:", error);
    return res.status(500).json({ message: "Server error deleting CMS page" });
  }
};

export const getPublicCmsPage = async (req, res) => {
  try {
    const page = await CmsPage.findOne({
      slug: req.params.slug.toLowerCase(),
      isPublished: true,
    });
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    return res.status(200).json({ page });
  } catch (error) {
    console.error("Get public CMS page error:", error);
    return res.status(500).json({ message: "Server error fetching page" });
  }
};
