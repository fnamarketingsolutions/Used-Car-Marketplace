import type { ListingPhotos, ListingStatus, MyListing } from "@/lib/api/types";

export const USER_STATUSES = ["Draft", "Live", "Paused", "Sold"] as const;

export const FUEL_TYPES = [
  "Petrol",
  "Diesel",
  "CNG",
  "Electric",
  "Hybrid",
  "LPG",
] as const;

export const TRANSMISSIONS = ["Manual", "Automatic"] as const;

export const BODY_TYPES = [
  "Hatchback",
  "Sedan",
  "SUV",
  "MUV",
  "Coupe",
  "Convertible",
  "Pickup",
  "Van",
  "Other",
] as const;

export const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"] as const;

export const ACCIDENT_HISTORY = ["None", "Minor", "Major"] as const;

export const INSURANCE_STATUS = ["Active", "Expired", "Not Available"] as const;

export const SERVICE_HISTORY = ["Full", "Partial", "None"] as const;

export const RC_AVAILABILITY = ["Available", "Not Available", "Applied"] as const;

export const LOAN_STATUS = ["No Loan", "Loan Active", "Loan Closed"] as const;

export const REQUIRED_PHOTO_SLOTS = [
  "front",
  "rear",
  "leftSide",
  "rightSide",
  "interior",
  "dashboard",
  "odometer",
  "engine",
] as const;

export type RequiredPhotoSlot = (typeof REQUIRED_PHOTO_SLOTS)[number];

export type ListingFormValues = {
  make: string;
  model: string;
  variant: string;
  manufacturingYear: string;
  registrationYear: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  kilometresDriven: string;
  numberOfOwners: string;
  colour: string;
  askingPrice: string;
  negotiable: boolean;
  overallCondition: string;
  accidentHistory: string;
  insuranceStatus: string;
  serviceHistory: string;
  rcAvailability: string;
  loanHypothecationStatus: string;
  additionalInformation: string;
  state: string;
  stateId: string;
  city: string;
};

export type ListingPhotoFiles = Partial<Record<RequiredPhotoSlot, File | null>> & {
  other?: File[];
};

export const emptyListingFormValues = (): ListingFormValues => ({
  make: "",
  model: "",
  variant: "",
  manufacturingYear: "",
  registrationYear: "",
  fuelType: "",
  transmission: "",
  bodyType: "",
  kilometresDriven: "",
  numberOfOwners: "",
  colour: "",
  askingPrice: "",
  negotiable: true,
  overallCondition: "",
  accidentHistory: "",
  insuranceStatus: "",
  serviceHistory: "",
  rcAvailability: "",
  loanHypothecationStatus: "",
  additionalInformation: "",
  state: "",
  stateId: "",
  city: "",
});

export function listingToFormValues(listing: MyListing): ListingFormValues {
  const cityId =
    typeof listing.city === "object" && listing.city?._id
      ? listing.city._id
      : "";

  return {
    make: listing.make ?? "",
    model: listing.model ?? "",
    variant: listing.variant ?? "",
    manufacturingYear:
      listing.manufacturingYear != null ? String(listing.manufacturingYear) : "",
    registrationYear:
      listing.registrationYear != null ? String(listing.registrationYear) : "",
    fuelType: listing.fuelType ?? "",
    transmission: listing.transmission ?? "",
    bodyType: listing.bodyType ?? "",
    kilometresDriven:
      listing.kilometresDriven != null ? String(listing.kilometresDriven) : "",
    numberOfOwners:
      listing.numberOfOwners != null ? String(listing.numberOfOwners) : "",
    colour: listing.colour ?? "",
    askingPrice: listing.askingPrice != null ? String(listing.askingPrice) : "",
    negotiable: listing.negotiable !== false,
    overallCondition: listing.overallCondition ?? "",
    accidentHistory: listing.accidentHistory ?? "",
    insuranceStatus: listing.insuranceStatus ?? "",
    serviceHistory: listing.serviceHistory ?? "",
    rcAvailability: listing.rcAvailability ?? "",
    loanHypothecationStatus: listing.loanHypothecationStatus ?? "",
    additionalInformation: listing.additionalInformation ?? "",
    state: listing.state || listing.city?.state || "",
    stateId: "",
    city: cityId,
  };
}

export const STEP_TITLES = [
  "Vehicle details",
  "Price & condition",
  "Extras & photos",
] as const;

const STEP1_REQUIRED = [
  "make",
  "model",
  "manufacturingYear",
  "registrationYear",
  "kilometresDriven",
  "state",
  "city",
] as const;

export function validateStep(
  step: number,
  values: ListingFormValues
): string | null {
  if (step === 0) {
    for (const key of STEP1_REQUIRED) {
      if (!String(values[key]).trim()) {
        return "Please fill make, model, years, kilometres, state, and city before continuing.";
      }
    }
    const my = Number(values.manufacturingYear);
    const ry = Number(values.registrationYear);
    const km = Number(values.kilometresDriven);
    if (!Number.isFinite(my) || my < 1980 || my > 2100) {
      return "Enter a valid manufacturing year.";
    }
    if (!Number.isFinite(ry) || ry < 1980 || ry > 2100) {
      return "Enter a valid registration year.";
    }
    if (!Number.isFinite(km) || km < 0) {
      return "Enter a valid kilometres driven value.";
    }
  }

  return null;
}

const TEXT_KEYS: (keyof ListingFormValues)[] = [
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
  "city",
];

const NUMBER_KEYS: (keyof ListingFormValues)[] = [
  "manufacturingYear",
  "registrationYear",
  "kilometresDriven",
  "numberOfOwners",
  "askingPrice",
];

export function buildListingFormData(
  values: ListingFormValues,
  photos: ListingPhotoFiles,
  options?: { status?: ListingStatus }
): FormData {
  const formData = new FormData();

  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value === "string" && value.trim()) {
      formData.append(key, value.trim());
    }
  }

  for (const key of NUMBER_KEYS) {
    const raw = values[key];
    if (typeof raw === "string" && raw.trim() !== "") {
      formData.append(key, raw.trim());
    }
  }

  formData.append("negotiable", values.negotiable ? "true" : "false");

  // Create sends Live (Active); omit on edit so PATCH does not touch status.
  if (options?.status) {
    formData.append("status", options.status);
  }

  for (const slot of REQUIRED_PHOTO_SLOTS) {
    const file = photos[slot];
    if (file instanceof File) {
      formData.append(slot, file);
    }
  }

  if (photos.other?.length) {
    for (const file of photos.other) {
      formData.append("other", file);
    }
  }

  return formData;
}

export function photoSlotLabel(slot: RequiredPhotoSlot | "other"): string {
  const labels: Record<string, string> = {
    front: "Front",
    rear: "Rear",
    leftSide: "Left side",
    rightSide: "Right side",
    interior: "Interior",
    dashboard: "Dashboard",
    odometer: "Odometer",
    engine: "Engine",
    other: "Other",
  };
  return labels[slot] ?? slot;
}

export function existingPhotoUrl(
  photos: ListingPhotos | undefined,
  slot: RequiredPhotoSlot
): string | null {
  return photos?.[slot]?.url ?? null;
}
