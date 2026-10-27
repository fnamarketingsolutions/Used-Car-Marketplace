import { apiFetch } from "./client";
import type { AuthResponse, AuthUser } from "./types";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

export type GoogleAuthResponse = AuthResponse & {
  needsPhone?: boolean;
};

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    json: payload,
    skipRefresh: true,
  });
}

export function register(payload: RegisterPayload) {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    json: payload,
    skipRefresh: true,
  });
}

export function googleLogin(idToken: string) {
  return apiFetch<GoogleAuthResponse>("/api/auth/google", {
    method: "POST",
    json: { idToken },
    skipRefresh: true,
  });
}

export function updatePhone(payload: {
  phoneNumber: string;
  password?: string;
}) {
  return apiFetch<{ message: string; user: AuthUser }>("/api/auth/phone", {
    method: "PATCH",
    json: payload,
  });
}

export function logout() {
  return apiFetch<{ message: string }>("/api/auth/logout", {
    method: "POST",
    skipRefresh: true,
  });
}

export function me() {
  return apiFetch<{ user: AuthUser }>("/api/auth/me", {
    method: "GET",
  });
}

export function refresh() {
  return apiFetch<{ message: string }>("/api/auth/refresh", {
    method: "POST",
    skipRefresh: true,
  });
}
