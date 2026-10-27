import mongoose from "mongoose";
import { slugify } from "../utils/slugify.js";

const photoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    variant: { type: String, trim: true },
    manufacturingYear: { type: Number, required: true },
    registrationYear: { type: Number, required: true },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", "LPG"],
    },
    transmission: {
      type: String,
      enum: ["Manual", "Automatic"],
    },
    bodyType: {
      type: String,
      enum: ["Hatchback", "Sedan", "SUV", "MUV", "Coupe", "Convertible", "Pickup", "Van", "Other"],
    },
    kilometresDriven: { type: Number, min: 0, required: true },
    numberOfOwners: { type: Number, min: 1 },
    colour: { type: String, trim: true },
    askingPrice: { type: Number, min: 0 },
    negotiable: { type: Boolean, default: true },
    overallCondition: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Poor"],
    },
    accidentHistory: {
      type: String,
      enum: ["None", "Minor", "Major"],
    },
    insuranceStatus: {
      type: String,
      enum: ["Active", "Expired", "Not Available"],
    },

    serviceHistory: {
      type: String,
      enum: ["Full", "Partial", "None"],
    },
    rcAvailability: {
      type: String,
      enum: ["Available", "Not Available", "Applied"],
    },
    loanHypothecationStatus: {
      type: String,
      enum: ["No Loan", "Loan Active", "Loan Closed"],
    },
    additionalInformation: { type: String, trim: true, maxlength: 2000 },
    state: { type: String, trim: true, required: true },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    photos: {
      front: photoSchema,
      rear: photoSchema,
      leftSide: photoSchema,
      rightSide: photoSchema,
      interior: photoSchema,
      dashboard: photoSchema,
      odometer: photoSchema,
      engine: photoSchema,
      other: { type: [photoSchema], default: [] },
    },
    status: {
      type: String,
      enum: ["Draft", "Live", "Paused", "Sold", "Expired", "Removed"],
      default: "Draft",
      index: true,
    },
    statusBeforeRemoval: {
      type: String,
      enum: ["Draft", "Live", "Paused", "Sold", "Expired"],
      default: null,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
     },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

listingSchema.index({ slug: 1 }, { unique: true, sparse: true });
listingSchema.index({ make: 1, model: 1, manufacturingYear: 1, slug: 1 });

listingSchema.methods.buildSlugBase = function buildSlugBase() {
  const parts = [
    this.variant,
    this.bodyType,
    this.manufacturingYear,
    this._id?.toString().slice(-6),
  ].filter(Boolean);
  return slugify(parts.join("-") || `listing-${this._id?.toString().slice(-6)}`);
};

listingSchema.pre("save", async function ensureSlug() {
  if (this.slug) return;
  const base = this.buildSlugBase();
  if (!base) return;
  let candidate = base;
  let i = 0;
  const ListingModel = this.constructor;
  while (await ListingModel.exists({ slug: candidate, _id: { $ne: this._id } })) {
    i += 1;
    candidate = `${base}-${i}`;
  }
  this.slug = candidate;
});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
