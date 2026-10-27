import { apiFetch } from "./client";
import type {
  CitiesResponse,
  LocationRequestsResponse,
  StatesResponse,
} from "./types";

export function getStates() {
  return apiFetch<StatesResponse>("/api/states", { method: "GET" });
}

export function getCities(params?: { stateId?: string; state?: string }) {
  const search = new URLSearchParams();
  if (params?.stateId) search.set("stateId", params.stateId);
  if (params?.state) search.set("state", params.state);
  const query = search.toString();
  return apiFetch<CitiesResponse>(`/api/cities${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function requestCity(payload: {
  cityName: string;
  stateId?: string;
  isOther?: boolean;
  stateName?: string;
  reason: string;
}) {
  return apiFetch<{ message: string; request: unknown }>(
    "/api/cities/request",
    { method: "POST", json: payload }
  );
}

export function listMyCityRequests(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<LocationRequestsResponse>(`/api/cities/requests/mine${q}`, {
    method: "GET",
  });
}
