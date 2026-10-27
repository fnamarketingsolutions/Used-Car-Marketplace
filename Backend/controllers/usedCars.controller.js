import Listing from "../models/Listing.js";
import City from "../models/City.js";
import State from "../models/State.js";
import { publicListingFilter } from "../utils/publicListings.js";
import { slugify } from "../utils/slugify.js";
import { serializeListingPublic } from "../utils/listingPublic.js";

const listPublic = async (extraFilter = {}) => {
  const filter = await publicListingFilter(extraFilter);
  return Listing.find(filter)
    .select(
      "make model variant manufacturingYear registrationYear fuelType transmission bodyType kilometresDriven numberOfOwners colour askingPrice negotiable overallCondition state city photos slug viewCount seller updatedAt createdAt"
    )
    .populate("city", "name state slug")
    .populate("seller", "fullName")
    .sort({ updatedAt: -1 })
    .lean();
};

export const byState = async (req, res) => {
  try {
    const state = await State.findOne({
      slug: req.params.stateSlug.toLowerCase(),
      isActive: true,
    }).lean();
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    const listings = await listPublic({
      state: new RegExp(`^${state.name}$`, "i"),
    });

    return res.status(200).json({
      state: { name: state.name, slug: state.slug },
      listings: listings.map((listing) =>
        serializeListingPublic(listing, { isLoggedIn: false })
      ),
    });
  } catch (error) {
    console.error("Used-cars by state error:", error);
    return res.status(500).json({ message: "Server error fetching listings" });
  }
};

export const byCity = async (req, res) => {
  try {
    const city = await City.findOne({
      slug: req.params.citySlug.toLowerCase(),
      isActive: true,
    }).lean();
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    const listings = await listPublic({ city: city._id });

    return res.status(200).json({
      city: { name: city.name, state: city.state, slug: city.slug },
      listings: listings.map((listing) =>
        serializeListingPublic(listing, { isLoggedIn: false })
      ),
    });
  } catch (error) {
    console.error("Used-cars by city error:", error);
    return res.status(500).json({ message: "Server error fetching listings" });
  }
};

export const getVehicleBySlug = async (req, res) => {
  try {
    const { make, model, year, listingSlug } = req.params;
    const yearNum = Number(year);
    if (!Number.isFinite(yearNum)) {
      return res.status(400).json({ message: "Invalid year" });
    }

    const makeSlug = slugify(make);
    const modelSlug = slugify(model);
    if (!makeSlug || !modelSlug || !listingSlug) {
      return res.status(400).json({ message: "Invalid listing path" });
    }

    const filter = await publicListingFilter({
      slug: listingSlug.toLowerCase(),
      manufacturingYear: yearNum,
    });

    const listing = await Listing.findOne(filter)
      .populate("city", "name state slug")
      .populate("seller", "fullName email phoneNumber privacySettings");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (
      slugify(listing.make || "") !== makeSlug ||
      slugify(listing.model || "") !== modelSlug
    ) {
      return res.status(404).json({ message: "Listing not found" });
    }

    await Listing.updateOne(
      { _id: listing._id },
      { $inc: { viewCount: 1 } }
    );
    listing.viewCount = (listing.viewCount || 0) + 1;

    const isLoggedIn = Boolean(req.user);
    return res.status(200).json({
      listing: serializeListingPublic(listing, { isLoggedIn }),
    });
  } catch (error) {
    console.error("Used-cars vehicle detail error:", error);
    return res.status(500).json({ message: "Server error fetching listing" });
  }
};
