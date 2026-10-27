import { API_BASE, apiFetch } from "./client";
import type { MakesResponse, ModelsResponse } from "./types";

export async function getMakes(opts?: {
  all?: boolean;
}): Promise<MakesResponse> {
  const params = new URLSearchParams();
  if (opts?.all) params.set("all", "true");
  const query = params.toString();

  if (opts?.all) {
    return apiFetch<MakesResponse>(`/api/makes${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  }

  const res = await fetch(
    `${API_BASE}/api/makes${query ? `?${query}` : ""}`,
    { method: "GET", cache: "no-store" }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ||
      res.statusText ||
      "Failed to load makes";
    throw new Error(message);
  }
  return res.json() as Promise<MakesResponse>;
}

export async function getModels(opts?: {
  make?: string;
  all?: boolean;
}): Promise<ModelsResponse> {
  const params = new URLSearchParams();
  if (opts?.make) params.set("make", opts.make);
  if (opts?.all) params.set("all", "true");
  const query = params.toString();

  if (opts?.all) {
    return apiFetch<ModelsResponse>(
      `/api/models${query ? `?${query}` : ""}`,
      { method: "GET" }
    );
  }

  const res = await fetch(
    `${API_BASE}/api/models${query ? `?${query}` : ""}`,
    { method: "GET", cache: "no-store" }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ||
      res.statusText ||
      "Failed to load models";
    throw new Error(message);
  }
  return res.json() as Promise<ModelsResponse>;
}

export function createMake(payload: { name: string; isActive?: boolean }) {
  return apiFetch<{ message: string; make: import("./types").CatalogMake }>(
    "/api/makes",
    { method: "POST", json: payload }
  );
}

export function updateMake(
  id: string,
  payload: { name?: string; isActive?: boolean }
) {
  return apiFetch<{ message: string; make: import("./types").CatalogMake }>(
    `/api/makes/${encodeURIComponent(id)}`,
    { method: "PATCH", json: payload }
  );
}

export function deleteMake(id: string) {
  return apiFetch<{ message: string; make: import("./types").CatalogMake }>(
    `/api/makes/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}

export function createModel(payload: {
  name: string;
  make: string;
  isActive?: boolean;
}) {
  return apiFetch<{ message: string; model: import("./types").CatalogModel }>(
    "/api/models",
    { method: "POST", json: payload }
  );
}

export function updateModel(
  id: string,
  payload: { name?: string; make?: string; isActive?: boolean }
) {
  return apiFetch<{ message: string; model: import("./types").CatalogModel }>(
    `/api/models/${encodeURIComponent(id)}`,
    { method: "PATCH", json: payload }
  );
}

export function deleteModel(id: string) {
  return apiFetch<{ message: string; model: import("./types").CatalogModel }>(
    `/api/models/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}
