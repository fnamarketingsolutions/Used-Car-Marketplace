import { ApiError } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

type ApiFetchOptions = RequestInit & {
  skipRefresh?: boolean;
  json?: unknown;
};

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipRefresh, json, headers, ...rest } = options;
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const init: RequestInit = {
    ...rest,
    credentials: "include",
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  };

  let response = await fetch(url, init);

  if (response.status === 401 && !skipRefresh) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      response = await fetch(url, init);
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ||
      response.statusText ||
      "Request failed";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
