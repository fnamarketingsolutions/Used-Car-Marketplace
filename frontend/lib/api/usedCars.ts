import { API_BASE, apiFetch } from "./client";
import type { PublicListing } from "./types";

export type PublicVehicleResponse = {
  listing: PublicListing;
};

export async function getPublicVehicle(input: {
  make: string;
  model: string;
  year: string | number;
  slug: string;
}): Promise<PublicVehicleResponse> {
  const make = encodeURIComponent(input.make);
  const model = encodeURIComponent(input.model);
  const year = encodeURIComponent(String(input.year));
  const slug = encodeURIComponent(input.slug);
  // Credentials so optionalProtect can expose phone when logged in
  return apiFetch<PublicVehicleResponse>(
    `/api/used-cars/${make}/${model}/${year}/${slug}`,
    { method: "GET", skipRefresh: false }
  );
}

/** Server-friendly fetch with cookies when available. */
export async function getPublicVehicleServer(input: {
  make: string;
  model: string;
  year: string | number;
  slug: string;
}): Promise<PublicVehicleResponse> {
  const make = encodeURIComponent(input.make);
  const model = encodeURIComponent(input.model);
  const year = encodeURIComponent(String(input.year));
  const slug = encodeURIComponent(input.slug);
  const res = await fetch(
    `${API_BASE}/api/used-cars/${make}/${model}/${year}/${slug}`,
    { method: "GET", cache: "no-store", credentials: "include" }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ||
      res.statusText ||
      "Listing not found";
    throw new Error(message);
  }
  return res.json() as Promise<PublicVehicleResponse>;
}
