import { apiFetch } from "./client";
import type { AuthUser, CatalogMake, CatalogModel } from "./types";

export type AdminDashboardResponse = {
  message: string;
  user: AuthUser;
  analytics: {
    usersCount: number;
    listingsByStatus: Record<string, number>;
    pendingReports: number;
    pendingCityRequests: number;
    pendingStateRequests: number;
    totalViews: number;
  };
};

export type AdminAnalyticsResponse = {
  analytics: {
    usersCount: number;
    newUsers: number;
    listingsByStatus: Record<string, number>;
    newListings: number;
    pendingReports: number;
    spamReports: number;
    fraudReports: number;
    totalViews: number;
    range: { from: string | null; to: string | null };
  };
};

export type AdminListing = {
  _id: string;
  make?: string;
  model?: string;
  variant?: string;
  manufacturingYear?: number;
  status?: string;
  askingPrice?: number;
  slug?: string;
  viewCount?: number;
  statusBeforeRemoval?: string | null;
  seller?: {
    _id?: string;
    fullName?: string;
    email?: string;
    accountStatus?: string;
  };
  city?: { name?: string; state?: string; slug?: string };
  sellerListingCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminReport = {
  _id: string;
  targetType?: string;
  category?: string;
  reason?: string;
  details?: string;
  status?: string;
  adminNote?: string;
  reporter?: { fullName?: string; email?: string };
  listing?: {
    _id?: string;
    make?: string;
    model?: string;
    variant?: string;
    manufacturingYear?: number;
    slug?: string;
    status?: string;
  };
  reportedUser?: {
    _id?: string;
    fullName?: string;
    email?: string;
    accountStatus?: string;
  };
  reviewedBy?: { fullName?: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
};

export type PlatformSettings = {
  _id?: string;
  siteName?: string;
  supportEmail?: string;
  supportPhone?: string;
  allowRegistration?: boolean;
  maxPhotosPerListing?: number;
  maintenanceMode?: boolean;
  extra?: Record<string, unknown>;
};

export function getAdminDashboard() {
  return apiFetch<AdminDashboardResponse>("/api/dashboard/admin", {
    method: "GET",
  });
}

export function getAdminAnalytics(params?: { from?: string; to?: string }) {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const q = search.toString();
  return apiFetch<AdminAnalyticsResponse>(
    `/api/admin/analytics${q ? `?${q}` : ""}`,
    { method: "GET" }
  );
}

export function listAdminUsers(params?: { status?: string; q?: string }) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.q) search.set("q", params.q);
  const q = search.toString();
  return apiFetch<{ users: AuthUser[] }>(
    `/api/admin/users${q ? `?${q}` : ""}`,
    { method: "GET" }
  );
}

export function getAdminUser(id: string) {
  return apiFetch<{
    user: AuthUser;
    listingStats: Record<string, number>;
    listings: AdminListing[];
  }>(`/api/admin/users/${encodeURIComponent(id)}`, { method: "GET" });
}

export function warnAdminUser(id: string, message: string) {
  return apiFetch<{ message: string; user: AuthUser }>(
    `/api/admin/users/${encodeURIComponent(id)}/warn`,
    { method: "POST", json: { message } }
  );
}

export function suspendAdminUser(id: string, reason?: string) {
  return apiFetch<{ message: string; user: AuthUser }>(
    `/api/admin/users/${encodeURIComponent(id)}/suspend`,
    { method: "POST", json: { reason } }
  );
}

export function unsuspendAdminUser(id: string) {
  return apiFetch<{ message: string; user: AuthUser }>(
    `/api/admin/users/${encodeURIComponent(id)}/unsuspend`,
    { method: "POST", json: {} }
  );
}

export function blockAdminUser(id: string, reason?: string) {
  return apiFetch<{ message: string; user: AuthUser }>(
    `/api/admin/users/${encodeURIComponent(id)}/block`,
    { method: "POST", json: { reason } }
  );
}

export function unblockAdminUser(id: string) {
  return apiFetch<{ message: string; user: AuthUser }>(
    `/api/admin/users/${encodeURIComponent(id)}/unblock`,
    { method: "POST", json: {} }
  );
}

export function listAdminListings(params?: {
  status?: string;
  seller?: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.seller) search.set("seller", params.seller);
  if (params?.q) search.set("q", params.q);
  const q = search.toString();
  return apiFetch<{ listings: AdminListing[] }>(
    `/api/admin/listings${q ? `?${q}` : ""}`,
    { method: "GET" }
  );
}

export function getAdminListingDetail(id: string) {
  return apiFetch<{
    listing: AdminListing & Record<string, unknown>;
    seller: {
      id?: string;
      fullName?: string;
      email?: string;
      phoneNumber?: string;
      role?: string;
      accountStatus?: string;
      createdAt?: string;
    } | null;
    listingStats: Record<string, number>;
  }>(`/api/admin/listings/${encodeURIComponent(id)}`, { method: "GET" });
}

export function removeAdminListing(id: string) {
  return apiFetch<{ message: string; listing: AdminListing }>(
    `/api/admin/listings/${encodeURIComponent(id)}/remove`,
    { method: "POST", json: {} }
  );
}

export function restoreAdminListing(id: string, status?: string) {
  return apiFetch<{ message: string; listing: AdminListing }>(
    `/api/admin/listings/${encodeURIComponent(id)}/restore`,
    { method: "POST", json: status ? { status } : {} }
  );
}

export function listAdminReports(params?: {
  status?: string;
  category?: string;
  targetType?: string;
}) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.category) search.set("category", params.category);
  if (params?.targetType) search.set("targetType", params.targetType);
  const q = search.toString();
  return apiFetch<{ reports: AdminReport[] }>(
    `/api/admin/reports${q ? `?${q}` : ""}`,
    { method: "GET" }
  );
}

export function reviewAdminReport(
  id: string,
  payload: { status: string; adminNote?: string }
) {
  return apiFetch<{ message: string; report: AdminReport }>(
    `/api/admin/reports/${encodeURIComponent(id)}`,
    { method: "PATCH", json: payload }
  );
}

export function getAdminSettings() {
  return apiFetch<{ settings: PlatformSettings }>("/api/admin/settings", {
    method: "GET",
  });
}

export function updateAdminSettings(payload: Partial<PlatformSettings>) {
  return apiFetch<{ message: string; settings: PlatformSettings }>(
    "/api/admin/settings",
    { method: "PATCH", json: payload }
  );
}

export function listAdminMakes() {
  return apiFetch<{ makes: CatalogMake[] }>("/api/makes?all=true", {
    method: "GET",
  });
}

export function listAdminModels(make?: string) {
  const search = new URLSearchParams({ all: "true" });
  if (make) search.set("make", make);
  return apiFetch<{ models: CatalogModel[] }>(
    `/api/models?${search.toString()}`,
    { method: "GET" }
  );
}

export type AdminState = {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
};

export type AdminCity = {
  _id: string;
  name: string;
  slug?: string;
  state?: string;
  stateId?: string | { _id?: string; name?: string };
  isActive?: boolean;
};

export type AdminGeoRequest = {
  _id: string;
  status?: string;
  stateName?: string;
  cityName?: string;
  state?: string;
  isNewState?: boolean;
  adminNote?: string;
  user?: { fullName?: string; email?: string };
  cityRequest?: string | { _id?: string; cityName?: string } | null;
  createdAt?: string;
};

export function listAdminStates() {
  return apiFetch<{ states: AdminState[] }>("/api/states?all=true", {
    method: "GET",
  });
}

export function createAdminState(payload: { name: string; isActive?: boolean }) {
  return apiFetch<{ message: string; state: AdminState }>("/api/states", {
    method: "POST",
    json: payload,
  });
}

export function updateAdminState(
  id: string,
  payload: { name?: string; isActive?: boolean }
) {
  return apiFetch<{ message: string; state: AdminState }>(
    `/api/states/${encodeURIComponent(id)}`,
    { method: "PATCH", json: payload }
  );
}

export function deleteAdminState(id: string) {
  return apiFetch<{ message: string; state: AdminState }>(
    `/api/states/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export function listStateRequests(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<{ requests: AdminGeoRequest[] }>(
    `/api/states/requests${q}`,
    { method: "GET" }
  );
}

export function reviewStateRequest(
  id: string,
  payload: { status: string; adminNote?: string }
) {
  return apiFetch<{ message: string }>(
    `/api/states/requests/${encodeURIComponent(id)}`,
    { method: "PATCH", json: payload }
  );
}

export function listAdminCities(stateId?: string) {
  const search = new URLSearchParams({ all: "true" });
  if (stateId) search.set("stateId", stateId);
  return apiFetch<{ cities: AdminCity[] }>(
    `/api/cities?${search.toString()}`,
    { method: "GET" }
  );
}

export function createAdminCity(payload: { name: string; stateId: string }) {
  return apiFetch<{ message: string; city: AdminCity }>("/api/cities", {
    method: "POST",
    json: payload,
  });
}

export function updateAdminCity(
  id: string,
  payload: { name?: string; stateId?: string; isActive?: boolean }
) {
  return apiFetch<{ message: string; city: AdminCity }>(
    `/api/cities/${encodeURIComponent(id)}`,
    { method: "PATCH", json: payload }
  );
}

export function deleteAdminCity(id: string) {
  return apiFetch<{ message: string; city: AdminCity }>(
    `/api/cities/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export function listCityRequests(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<{ requests: AdminGeoRequest[] }>(
    `/api/cities/requests${q}`,
    { method: "GET" }
  );
}

export function reviewCityRequest(
  id: string,
  payload: { status: string; adminNote?: string }
) {
  return apiFetch<{ message: string }>(
    `/api/cities/requests/${encodeURIComponent(id)}`,
    { method: "PATCH", json: payload }
  );
}
