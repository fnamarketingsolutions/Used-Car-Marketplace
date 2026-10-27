/**
 * Canonical SEO paths for used-cars (frontend-only).
 */

export const USED_CARS_BASE = "/used-cars";

const RESERVED_SEGMENTS = new Set(["city", "state"]);

export function slugifySegment(value = ""): string {
  return (
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

function joinUsedCars(...segments: string[]): string {
  return [USED_CARS_BASE, ...segments.filter(Boolean)].join("/");
}

export function vehicleUrl(input: {
  make?: string | null;
  model?: string | null;
  year?: number | string | null;
  listingSlug?: string | null;
}): string | null {
  const make = slugifySegment(input.make || "");
  const model = slugifySegment(input.model || "");
  const year = input.year != null ? String(input.year).trim() : "";
  const listingSlug = String(input.listingSlug || "")
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, "");

  if (!input.make || !make || make === "item") return null;
  if (!input.model || !model || model === "item") return null;
  if (!/^\d{4}$/.test(year)) return null;
  if (!listingSlug) return null;

  return joinUsedCars(make, model, year, listingSlug);
}

/** Interim public detail page (SEO /used-cars pages not mounted yet). */
export function publicVehicleHref(input: {
  make?: string | null;
  model?: string | null;
  year?: number | string | null;
  listingSlug?: string | null;
  path?: string | null;
}): string | null {
  if (input.path?.startsWith(`${USED_CARS_BASE}/`)) {
    return `/buy/vehicle/${input.path.slice(USED_CARS_BASE.length + 1)}`;
  }
  const seo = vehicleUrl(input);
  if (!seo) return null;
  return `/buy/vehicle/${seo.slice(USED_CARS_BASE.length + 1)}`;
}

export function cityUrl(citySlugOrName: string): string {
  return joinUsedCars("city", slugifySegment(citySlugOrName));
}

export function stateUrl(stateSlugOrName: string): string {
  return joinUsedCars("state", slugifySegment(stateSlugOrName));
}

export function makeUrl(make: string): string {
  return joinUsedCars(slugifySegment(make));
}

export function makeCityUrl(make: string, citySlugOrName: string): string {
  return joinUsedCars(slugifySegment(make), slugifySegment(citySlugOrName));
}

export function makeModelCityUrl(
  make: string,
  model: string,
  citySlugOrName: string
): string {
  return joinUsedCars(
    slugifySegment(make),
    slugifySegment(model),
    slugifySegment(citySlugOrName)
  );
}

export type ParsedUsedCarsPath =
  | {
      type: "vehicle";
      make: string;
      model: string;
      year: number;
      listingSlug: string;
    }
  | { type: "city"; citySlug: string }
  | { type: "state"; stateSlug: string }
  | { type: "make"; make: string }
  | { type: "makeCity"; make: string; citySlug: string }
  | { type: "makeModelCity"; make: string; model: string; citySlug: string };

export function parseUsedCarsPath(
  pathname: string
): ParsedUsedCarsPath | null {
  if (!pathname) return null;

  let path = pathname.split("?")[0].split("#")[0].trim();
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/+$/, "") || "/";

  const prefix = USED_CARS_BASE;
  if (path !== prefix && !path.startsWith(`${prefix}/`)) return null;

  const rest = path.slice(prefix.length).replace(/^\//, "");
  if (!rest) return null;

  const segments = rest.split("/").filter(Boolean).map((s) => s.toLowerCase());
  if (segments.length === 0) return null;

  if (segments.length === 2 && segments[0] === "city") {
    return { type: "city", citySlug: segments[1] };
  }
  if (segments.length === 2 && segments[0] === "state") {
    return { type: "state", stateSlug: segments[1] };
  }

  if (segments.length === 4 && /^\d{4}$/.test(segments[2])) {
    return {
      type: "vehicle",
      make: segments[0],
      model: segments[1],
      year: Number(segments[2]),
      listingSlug: segments[3],
    };
  }

  if (segments.length === 3 && !RESERVED_SEGMENTS.has(segments[0])) {
    return {
      type: "makeModelCity",
      make: segments[0],
      model: segments[1],
      citySlug: segments[2],
    };
  }

  if (segments.length === 2 && !RESERVED_SEGMENTS.has(segments[0])) {
    return {
      type: "makeCity",
      make: segments[0],
      citySlug: segments[1],
    };
  }

  if (segments.length === 1 && !RESERVED_SEGMENTS.has(segments[0])) {
    return { type: "make", make: segments[0] };
  }

  return null;
}
