import { apiFetch } from "./client";
import type {
  AlertsResponse,
  ContactedSellersResponse,
  DashboardResponse,
  InquiriesResponse,
  SavedCarsResponse,
  SavedSearchesResponse,
} from "./types";

export function getDashboard() {
  return apiFetch<DashboardResponse>("/api/dashboard", {
    method: "GET",
  });
}

export function getSavedCars() {
  return apiFetch<SavedCarsResponse>("/api/dashboard/saved-cars", {
    method: "GET",
  });
}

export function saveCar(listingId: string) {
  return apiFetch<{ message: string }>("/api/dashboard/saved-cars", {
    method: "POST",
    json: { listingId },
  });
}

export function unsaveCar(listingId: string) {
  return apiFetch<{ message: string }>(
    `/api/dashboard/saved-cars/${encodeURIComponent(listingId)}`,
    { method: "DELETE" }
  );
}

export function getSavedSearches() {
  return apiFetch<SavedSearchesResponse>("/api/dashboard/saved-searches", {
    method: "GET",
  });
}

export function deleteSavedSearch(id: string) {
  return apiFetch<{ message: string }>(
    `/api/dashboard/saved-searches/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export function getContactedSellers() {
  return apiFetch<ContactedSellersResponse>(
    "/api/dashboard/contacted-sellers",
    { method: "GET" }
  );
}

export function getSellerInquiries() {
  return apiFetch<InquiriesResponse>("/api/dashboard/sell/inquiries", {
    method: "GET",
  });
}

export function getAlerts() {
  return apiFetch<AlertsResponse>("/api/dashboard/alerts", {
    method: "GET",
  });
}

export function createInquiry(input: { listingId: string; message: string }) {
  return apiFetch<{ message: string }>("/api/dashboard/inquiries", {
    method: "POST",
    json: {
      listingId: input.listingId,
      message: input.message,
    },
  });
}
