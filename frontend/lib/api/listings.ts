import { apiFetch, API_BASE } from "./client";
import type {
  ListingByIdResponse,
  ListingMutationResponse,
  MyListingsResponse,
  PublicListingsResponse,
} from "./types";

export async function getPublicListings(opts?: {
  page?: number;
  limit?: number;
  q?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  make?: string;
  model?: string;
}): Promise<PublicListingsResponse> {
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? 12;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (opts?.q?.trim()) params.set("q", opts.q.trim());
  if (opts?.minPrice !== undefined && opts.minPrice !== "") {
    params.set("minPrice", String(opts.minPrice));
  }
  if (opts?.maxPrice !== undefined && opts.maxPrice !== "") {
    params.set("maxPrice", String(opts.maxPrice));
  }
  if (opts?.make?.trim()) params.set("make", opts.make.trim());
  if (opts?.model?.trim()) params.set("model", opts.model.trim());

  const res = await fetch(`${API_BASE}/api/listings/public?${params}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ||
      res.statusText ||
      "Failed to load listings";
    throw new Error(message);
  }
  return res.json() as Promise<PublicListingsResponse>;
}

export function getMyListings(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<MyListingsResponse>(`/api/listings/mine${query}`, {
    method: "GET",
  });
}

export function getListingById(id: string) {
  return apiFetch<ListingByIdResponse>(`/api/listings/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export function createListing(formData: FormData) {
  return apiFetch<ListingMutationResponse>("/api/listings", {
    method: "POST",
    body: formData,
  });
}

export function updateListing(id: string, formData: FormData) {
  return apiFetch<ListingMutationResponse>(
    `/api/listings/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: formData,
    }
  );
}

export function updateListingStatus(id: string, status: string) {
  return apiFetch<ListingMutationResponse>(
    `/api/listings/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      json: { status },
    }
  );
}

export function deleteListing(id: string) {
  return apiFetch<{ message: string }>(
    `/api/listings/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}
