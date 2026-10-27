import { slugify } from "./slugify.js";

const CONDITION_STARS = {
  Excellent: 5,
  Good: 4,
  Fair: 3,
  Poor: 2,
};

export const starsFromCondition = (overallCondition) =>
  CONDITION_STARS[overallCondition] ?? null;

export const listingPath = (listing) => {
  const makeSlug = slugify(listing.make || "");
  const modelSlug = slugify(listing.model || "");
  const year = listing.manufacturingYear;
  const listingSlug = listing.slug;
  if (!makeSlug || !modelSlug || !year || !listingSlug) return null;
  return `/used-cars/${makeSlug}/${modelSlug}/${year}/${listingSlug}`;
};

const photoUrlOnly = (photo) => {
  if (!photo?.url) return undefined;
  return { url: photo.url };
};

export const serializePhotosPublic = (photos = {}) => {
  const slots = [
    "front",
    "rear",
    "leftSide",
    "rightSide",
    "interior",
    "dashboard",
    "odometer",
    "engine",
  ];
  const result = {};
  for (const slot of slots) {
    const mapped = photoUrlOnly(photos[slot]);
    if (mapped) result[slot] = mapped;
  }
  result.other = (photos.other || [])
    .map(photoUrlOnly)
    .filter(Boolean);
  return result;
};

export const buildSellerPublic = (seller, { isLoggedIn } = {}) => {
  if (!seller) {
    return {
      _id: null,
      fullName: null,
      phoneNumber: null,
      email: null,
      phoneVisible: false,
      stars: null,
    };
  }

  const privacy = seller.privacySettings || {};
  const allowPhone = privacy.showPhoneToBuyers !== false;
  const allowEmail = privacy.showEmailToBuyers === true;

  const phoneVisible = Boolean(isLoggedIn && allowPhone);
  const emailVisible = Boolean(isLoggedIn && allowEmail);

  return {
    _id: seller._id ? String(seller._id) : null,
    fullName: seller.fullName || null,
    phoneNumber: phoneVisible ? seller.phoneNumber || null : null,
    email: emailVisible ? seller.email || null : null,
    phoneVisible,
    stars: null,
  };
};

export const serializeListingPublic = (listing, { isLoggedIn = false } = {}) => {
  const city = listing.city;
  const seller = buildSellerPublic(listing.seller, { isLoggedIn });
  const stars = starsFromCondition(listing.overallCondition);
  seller.stars = stars;

  const photos = serializePhotosPublic(listing.photos || {});
  const path = listingPath(listing);

  return {
    _id: listing._id ? String(listing._id) : null,
    make: listing.make || null,
    model: listing.model || null,
    variant: listing.variant || null,
    manufacturingYear: listing.manufacturingYear,
    registrationYear: listing.registrationYear,
    fuelType: listing.fuelType || null,
    transmission: listing.transmission || null,
    bodyType: listing.bodyType || null,
    kilometresDriven: listing.kilometresDriven,
    numberOfOwners: listing.numberOfOwners ?? null,
    colour: listing.colour || null,
    askingPrice: listing.askingPrice ?? null,
    negotiable: listing.negotiable,
    overallCondition: listing.overallCondition || null,
    accidentHistory: listing.accidentHistory || null,
    insuranceStatus: listing.insuranceStatus || null,
    serviceHistory: listing.serviceHistory || null,
    rcAvailability: listing.rcAvailability || null,
    loanHypothecationStatus: listing.loanHypothecationStatus || null,
    additionalInformation: listing.additionalInformation || null,
    state: listing.state || null,
    city: city
      ? {
          name: city.name,
          state: city.state,
          slug: city.slug,
        }
      : null,
    photos,
    slug: listing.slug || null,
    path,
    viewCount: listing.viewCount || 0,
    stars,
    primaryImage: photos.front?.url || null,
    seller,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
};

export const serializeListingSummary = (listing) => {
  if (!listing) return null;
  const frontUrl = listing.photos?.front?.url || null;
  return {
    make: listing.make || null,
    model: listing.model || null,
    variant: listing.variant || null,
    manufacturingYear: listing.manufacturingYear,
    slug: listing.slug || null,
    askingPrice: listing.askingPrice ?? null,
    status: listing.status || null,
    frontImage: frontUrl,
    path: listingPath(listing),
    stars: starsFromCondition(listing.overallCondition),
  };
};

const buyerProfileForSeller = (buyer) => {
  if (!buyer) return null;
  return {
    fullName: buyer.fullName || null,
    email: buyer.email || null,
    phoneNumber: buyer.phoneNumber || null,
  };
};

const sellerProfileForBuyer = (seller) => {
  if (!seller) return null;
  const privacy = seller.privacySettings || {};
  return {
    fullName: seller.fullName || null,
    email: privacy.showEmailToBuyers === true ? seller.email || null : null,
    phoneNumber:
      privacy.showPhoneToBuyers !== false ? seller.phoneNumber || null : null,
  };
};

/** Enrich inquiry for buyer or seller dashboards (no raw ObjectIds). */
export const serializeInquiry = (inquiry, { viewerRole } = {}) => {
  const listing = serializeListingSummary(inquiry.listing);
  const buyer =
    viewerRole === "seller" || viewerRole === "admin"
      ? buyerProfileForSeller(inquiry.buyer)
      : inquiry.buyer
        ? { fullName: inquiry.buyer.fullName || null }
        : null;
  const seller =
    viewerRole === "buyer"
      ? sellerProfileForBuyer(inquiry.seller)
      : inquiry.seller
        ? { fullName: inquiry.seller.fullName || null }
        : null;

  return {
    buyerName: inquiry.buyer?.fullName || null,
    buyerProfile: buyer,
    sellerProfile: seller,
    listing,
    inquiryMessage: inquiry.message,
    status: inquiry.status,
    dateTime: {
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
    },
    contactActivity: inquiry.contactActivity || [],
  };
};

export const INQUIRY_LISTING_POPULATE =
  "make model variant manufacturingYear slug status askingPrice photos.front overallCondition";

export const activityForStatus = (status) => {
  if (status === "replied") return "seller_replied";
  if (status === "closed") return "closed";
  return null;
};
