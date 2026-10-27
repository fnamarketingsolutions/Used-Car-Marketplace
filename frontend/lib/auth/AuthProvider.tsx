"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  googleLogin as apiGoogleLogin,
  login as apiLogin,
  logout as apiLogout,
  me,
  register as apiRegister,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/api/auth";
import { ApiError, type AuthUser } from "@/lib/api/types";

type GoogleLoginResult = {
  user: AuthUser;
  needsPhone: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string) => Promise<GoogleLoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const ALLOWED_ROLES = new Set(["user", "admin"]);

async function ensureAllowedRole(user: AuthUser): Promise<AuthUser> {
  if (!ALLOWED_ROLES.has(user.role)) {
    await apiLogout().catch(() => undefined);
    throw new ApiError("Unsupported account role.", 403, { role: user.role });
  }
  return user;
}

/** Default post-login destination by role, honoring a safe `next` path. */
export function resolvePostLoginPath(
  user: AuthUser,
  nextPath?: string | null
): string {
  const next =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : null;

  if (user.role === "admin") {
    if (next?.startsWith("/admin")) return next;
    return "/admin/dashboard";
  }

  if (next?.startsWith("/admin")) return "/dashboard";
  return next || "/dashboard";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { user: next } = await me();
      const allowed = await ensureAllowedRole(next);
      setUser(allowed);
      return allowed;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { user: next } = await me();
        if (!active) return;
        if (!ALLOWED_ROLES.has(next.role)) {
          await apiLogout().catch(() => undefined);
          setUser(null);
        } else {
          setUser(next);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await apiLogin(payload);
    const allowed = await ensureAllowedRole(res.user);
    setUser(allowed);
    return allowed;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await apiRegister(payload);
    const allowed = await ensureAllowedRole(res.user);
    setUser(allowed);
    return allowed;
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await apiGoogleLogin(idToken);
    const allowed = await ensureAllowedRole(res.user);
    setUser(allowed);
    return {
      user: allowed,
      needsPhone: Boolean(res.needsPhone || !allowed.phoneNumber),
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshUser,
      setUser,
    }),
    [user, loading, login, register, loginWithGoogle, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
