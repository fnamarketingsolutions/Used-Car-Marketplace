import type { ListingPhotos, MyListing } from "@/lib/api/types";

export function formatPrice(value?: number) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function listingTitle(listing: Pick<MyListing, "manufacturingYear" | "make" | "model">) {
  const parts = [listing.manufacturingYear, listing.make, listing.model].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Untitled listing";
}

export function formatKm(value?: number) {
  if (value == null) return "—";
  return `${new Intl.NumberFormat("en-IN").format(value)} km`;
}

export function collectPhotoUrls(photos?: ListingPhotos): { label: string; url: string }[] {
  if (!photos) return [];

  const entries: { label: string; url: string }[] = [];
  const named: [keyof Omit<ListingPhotos, "other">, string][] = [
    ["front", "Front"],
    ["rear", "Rear"],
    ["leftSide", "Left"],
    ["rightSide", "Right"],
    ["interior", "Interior"],
    ["dashboard", "Dashboard"],
    ["odometer", "Odometer"],
    ["engine", "Engine"],
  ];

  for (const [key, label] of named) {
    const photo = photos[key];
    if (photo?.url) entries.push({ label, url: photo.url });
  }

  for (const [index, photo] of (photos.other || []).entries()) {
    if (photo?.url) entries.push({ label: `Other ${index + 1}`, url: photo.url });
  }

  return entries;
}
