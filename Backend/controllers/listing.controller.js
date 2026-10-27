import Listing from "../models/Listing.js";
import City from "../models/City.js";
import {
  cleanupTempFiles,
  destroyImage,
  isCloudinaryUploadError,
  uploadImage,
} from "../config/cloudinary.js";
import { publicListingFilter } from "../utils/publicListings.js";
import { serializeListingPublic } from "../utils/listingPublic.js";
const USER_STATUSES = ["Draft", "Live", "Paused", "Sold"];
const REQUIRED_PHOTO_SLOTS = [
  "front",
  "rear",
  "leftSide",
  "rightSide",
  "interior",
  "dashboard",
  "odometer",
  "engine",
];

const CREATE_REQUIRED_FIELDS = [
  "make",
  "model",
  "manufacturingYear",
  "registrationYear",
  "kilometresDriven",
  "state",
  "city",
];

const LIVE_REQUIRED_FIELDS = [
  "make",
  "model",
  "variant",
  "manufacturingYear",
  "registrationYear",
  "fuelType",
  "transmission",
  "bodyType",
  "kilometresDriven",
  "numberOfOwners",
  "colour",
  "askingPrice",
  "overallCondition",
  "accidentHistory",
  "insuranceStatus",
  "serviceHistory",
  "rcAvailability",
  "loanHypothecationStatus",
  "state",
  "city",
];

const TEXT_FIELDS = [
  "make",
  "model",
  "variant",
  "fuelType",
  "transmission",
  "bodyType",
  "colour",
  "overallCondition",
  "accidentHistory",
  "insuranceStatus",
  "serviceHistory",
  "rcAvailability",
  "loanHypothecationStatus",
  "additionalInformation",
  "state",
];

const NUMBER_FIELDS = [
  "manufacturingYear",
  "registrationYear",
  "kilometresDriven",
  "numberOfOwners",
  "askingPrice",
];

const sendListingMutationError = (res, error, logLabel, fallbackMessage) => {
  console.error(logLabel, error);
  if (isCloudinaryUploadError(error)) {
    return res.status(502).json({
      message: error.message || "Image upload failed",
    });
  }
  return res
    .status(error.statusCode || 500)
    .json({ message: error.message || fallbackMessage });
};

const pickBody = (body) => {
  const data = {};

  for (const key of TEXT_FIELDS) {
    if (body[key] !== undefined && body[key] !== "") {
      data[key] = String(body[key]).trim();
    }
  }

  for (const key of NUMBER_FIELDS) {
    if (body[key] !== undefined && body[key] !== "") {
      data[key] = Number(body[key]);
    }
  }

  if (body.negotiable !== undefined) {
    data.negotiable =
      body.negotiable === true ||
      body.negotiable === "true" ||
      body.negotiable === "1";
  }

  if (body.city !== undefined && body.city !== "") {
    data.city = body.city;
  }

  if (body.status !== undefined && body.status !== "") {
    data.status = body.status;
  }

  return data;
};

const assertActiveCity = async (cityId) => {
  const city = await City.findOne({ _id: cityId, isActive: true });
  if (!city) {
    const err = new Error("City must be selected from the active city list");
    err.statusCode = 400;
    throw err;
  }
  return city;
};

const applyUploadedPhotos = async (listing, files) => {
  if (!files) return;

  const slotJobs = REQUIRED_PHOTO_SLOTS.map(async (slot) => {
    const file = files[slot]?.[0];
    if (!file?.path) return null;

    if (listing.photos?.[slot]?.publicId) {
      await destroyImage(listing.photos[slot].publicId);
    }
    const uploaded = await uploadImage(file.path);
    return { slot, uploaded };
  });

  const otherJobs = (files.other || [])
    .filter((file) => file?.path)
    .map((file) => uploadImage(file.path));

  const [slotResults, otherUploads] = await Promise.all([
    Promise.all(slotJobs),
    Promise.all(otherJobs),
  ]);

  for (const result of slotResults) {
    if (!result) continue;
    listing.photos[result.slot] = result.uploaded;
  }

  if (otherUploads.length) {
    listing.photos.other.push(...otherUploads);
  }
};

const isEmptyFieldValue = (value) =>
  value === undefined || value === null || value === "";

const missingRequiredFields = (source, fields) => {
  const missing = [];
  for (const field of fields) {
    if (isEmptyFieldValue(source[field])) {
      missing.push(field);
    }
  }
  return missing;
};

const formatMissingFieldsMessage = (prefix, fields) =>
  `${prefix}: ${fields.join(", ")}`;

const validateLive = (listing) => {
  const missing = missingRequiredFields(listing, LIVE_REQUIRED_FIELDS);

  if (listing.negotiable === undefined || listing.negotiable === null) {
    missing.push("negotiable");
  }

  for (const slot of REQUIRED_PHOTO_SLOTS) {
    if (!listing.photos?.[slot]?.url) {
      missing.push(`photos.${slot}`);
    }
  }

  return missing;
};

const ensureOwner = (listing, userId) => {
  if (String(listing.seller) !== String(userId)) {
    const err = new Error("Not authorized to manage this listing");
    err.statusCode = 403;
    throw err;
  }
};

export const createListing = async (req, res) => {
  try {
    const data = pickBody(req.body);
    data.seller = req.user._id;
    data.status = data.status && USER_STATUSES.includes(data.status) ? data.status : "Draft";

    if (data.status === "Removed" || data.status === "Expired") {
      return res.status(400).json({ message: "Invalid status for create" });
    }

    const missingCreate = missingRequiredFields(data, CREATE_REQUIRED_FIELDS);
    if (missingCreate.length) {
      return res.status(400).json({
        message: formatMissingFieldsMessage(
          "Listing is missing required fields",
          missingCreate
        ),
        missing: missingCreate,
      });
    }

    if (data.city) {
      await assertActiveCity(data.city);
    }

    const listing = new Listing(data);
    await applyUploadedPhotos(listing, req.files);

    if (listing.status === "Live") {
      const missing = validateLive(listing);
      if (missing.length) {
        return res.status(400).json({
          message: formatMissingFieldsMessage(
            "Listing is incomplete for Live status",
            missing
          ),
          missing,
        });
      }
    }

    await listing.save();
    await listing.populate("city", "name state slug");

    return res.status(201).json({ message: "Listing created", listing });
  } catch (error) {
    return sendListingMutationError(
      res,
      error,
      "Create listing error:",
      "Server error creating listing"
    );
  } finally {
    await cleanupTempFiles(req.files);
  }
};

export const getMyListings = async (req, res) => {
  try {
    const filter = { seller: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const listings = await Listing.find(filter)
      .populate("city", "name state slug")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ listings });
  } catch (error) {
    console.error("Get my listings error:", error);
    return res.status(500).json({ message: "Server error fetching listings" });
  }
};

export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("city", "name state slug")
      .populate("seller", "fullName email phoneNumber");

    if (!listing || listing.status === "Removed") {
      return res.status(404).json({ message: "Listing not found" });
    }

    const isOwner = String(listing.seller._id || listing.seller) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin && listing.status !== "Live") {
      return res.status(403).json({ message: "Listing is not publicly available" });
    }

    return res.status(200).json({ listing });
  } catch (error) {
    console.error("Get listing error:", error);
    return res.status(500).json({ message: "Server error fetching listing" });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.status === "Removed") {
      return res.status(404).json({ message: "Listing not found" });
    }

    ensureOwner(listing, req.user._id);

    if (["Sold", "Expired", "Removed"].includes(listing.status)) {
      return res.status(400).json({
        message: `Cannot update a listing with status ${listing.status}`,
      });
    }

    const data = pickBody(req.body);
    delete data.status;

    const clearedRequired = CREATE_REQUIRED_FIELDS.filter((field) => {
      if (req.body[field] === undefined) return false;
      return isEmptyFieldValue(req.body[field]);
    });
    if (clearedRequired.length) {
      return res.status(400).json({
        message: formatMissingFieldsMessage(
          "Required fields cannot be cleared",
          clearedRequired
        ),
        missing: clearedRequired,
      });
    }

    if (data.city) {
      await assertActiveCity(data.city);
    }

    const slugFieldsChanged =
      (data.make !== undefined && data.make !== listing.make) ||
      (data.model !== undefined && data.model !== listing.model) ||
      (data.variant !== undefined && data.variant !== listing.variant) ||
      (data.bodyType !== undefined && data.bodyType !== listing.bodyType) ||
      (data.manufacturingYear !== undefined &&
        data.manufacturingYear !== listing.manufacturingYear);

    Object.assign(listing, data);
    if (slugFieldsChanged) {
      listing.slug = null;
    }
    await applyUploadedPhotos(listing, req.files);

    if (listing.status === "Live") {
      const missing = validateLive(listing);
      if (missing.length) {
        return res.status(400).json({
          message: formatMissingFieldsMessage(
            "Listing is incomplete for Live status",
            missing
          ),
          missing,
        });
      }
    }

    await listing.save();
    await listing.populate("city", "name state slug");

    return res.status(200).json({ message: "Listing updated", listing });
  } catch (error) {
    return sendListingMutationError(
      res,
      error,
      "Update listing error:",
      "Server error updating listing"
    );
  } finally {
    await cleanupTempFiles(req.files);
  }
};

export const updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.status === "Removed") {
      return res.status(404).json({ message: "Listing not found" });
    }

    const isAdmin = req.user.role === "admin";
    if (!isAdmin) {
      ensureOwner(listing, req.user._id);
    }

    if (!isAdmin && !USER_STATUSES.includes(status)) {
      return res.status(403).json({
        message: "Users can only set Draft, Live, Paused, or Sold",
      });
    }

    const allowed = ["Draft", "Live", "Paused", "Sold", "Expired", "Removed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (status === "Live") {
      const missing = validateLive(listing);
      if (missing.length) {
        return res.status(400).json({
          message: formatMissingFieldsMessage(
            "Listing is incomplete for Live status",
            missing
          ),
          missing,
        });
      }
    }

    if (status === "Removed" && listing.status !== "Removed") {
      listing.statusBeforeRemoval = listing.status;
    }
    if (status !== "Removed") {
      listing.statusBeforeRemoval = null;
    }

    listing.status = status;
    await listing.save();
    await listing.populate("city", "name state slug");

    return res.status(200).json({ message: "Status updated", listing });
  } catch (error) {
    console.error("Update listing status error:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Server error updating status" });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.status === "Removed") {
      return res.status(404).json({ message: "Listing not found" });
    }

    ensureOwner(listing, req.user._id);

    if (listing.status !== "Draft") {
      return res.status(400).json({
        message: "Only Draft listings can be deleted. Use status Sold or Paused otherwise.",
      });
    }

    for (const slot of REQUIRED_PHOTO_SLOTS) {
      if (listing.photos?.[slot]?.publicId) {
        await destroyImage(listing.photos[slot].publicId);
      }
    }
    for (const photo of listing.photos?.other || []) {
      await destroyImage(photo.publicId);
    }

    await listing.deleteOne();
    return res.status(200).json({ message: "Draft listing deleted" });
  } catch (error) {
    console.error("Delete listing error:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Server error deleting listing" });
  }
};

/** Escape user input for safe RegExp construction. */
const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Public Live listings with pagination (no auth). */
export const getPublicListings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
    const rawLimit = parseInt(String(req.query.limit || "12"), 10) || 12;
    const limit = Math.min(48, Math.max(1, rawLimit));
    const skip = (page - 1) * limit;

    const extra = {};

    const make = req.query.make ? String(req.query.make).trim() : "";
    if (make) {
      extra.make = new RegExp(`^${escapeRegex(make)}$`, "i");
    }

    const model = req.query.model ? String(req.query.model).trim() : "";
    if (model) {
      extra.model = new RegExp(`^${escapeRegex(model)}$`, "i");
    }

    const minPrice = parseFloat(String(req.query.minPrice || ""));
    const maxPrice = parseFloat(String(req.query.maxPrice || ""));
    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
      extra.askingPrice = {};
      if (Number.isFinite(minPrice)) extra.askingPrice.$gte = minPrice;
      if (Number.isFinite(maxPrice)) extra.askingPrice.$lte = maxPrice;
    }

    const q = req.query.q ? String(req.query.q).trim() : "";
    if (q) {
      const pattern = new RegExp(escapeRegex(q), "i");
      extra.$or = [
        { make: pattern },
        { model: pattern },
        { variant: pattern },
        { additionalInformation: pattern },
        { colour: pattern },
        { fuelType: pattern },
        { bodyType: pattern },
      ];
    }

    const filter = await publicListingFilter(extra);
    const [total, listings] = await Promise.all([
      Listing.countDocuments(filter),
      Listing.find(filter)
        .select(
          "make model variant manufacturingYear registrationYear fuelType transmission bodyType kilometresDriven numberOfOwners colour askingPrice negotiable overallCondition accidentHistory insuranceStatus serviceHistory rcAvailability loanHypothecationStatus additionalInformation state city photos slug viewCount seller updatedAt createdAt"
        )
        .populate("city", "name state slug")
        .populate("seller", "fullName privacySettings phoneNumber email")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

    return res.status(200).json({
      listings: listings.map((listing) =>
        serializeListingPublic(listing, { isLoggedIn: false })
      ),
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Public listings error:", error);
    return res.status(500).json({ message: "Server error fetching listings" });
  }
};
