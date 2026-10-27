"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import PasswordField from "@/components/auth/PasswordField";
import PageLoader from "@/components/ui/PageLoader";
import { resolvePostLoginPath, useAuth } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/lib/api/types";

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginForm() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      const dest = resolvePostLoginPath(user, nextParam);
      if (user.role !== "admin" && !user.phoneNumber) {
        router.replace(
          `/complete-profile?next=${encodeURIComponent(dest)}`
        );
        return;
      }
      router.replace(dest);
    }
  }, [authLoading, user, router, nextParam]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loggedIn = await login({ email, password });
      const dest = resolvePostLoginPath(loggedIn, nextParam);
      if (loggedIn.role !== "admin" && !loggedIn.phoneNumber) {
        router.replace(
          `/complete-profile?next=${encodeURIComponent(dest)}`
        );
      } else {
        router.replace(dest);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  const signupNext = nextParam || "/dashboard";

  return (
    <AuthSplitLayout title="Login">
      <p className="section-kicker">Welcome back</p>
      <h1 className="section-title mt-2">Login</h1>
      <p className="section-copy mt-3">
        Sign in to manage listings and sell from your dashboard.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error ? <p className="form-error">{error}</p> : null}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="btn-primary min-w-[8rem] flex-1"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          <GoogleSignInButton
            next={signupNext}
            onError={(message) => setError(message)}
            className="flex-1"
          />
        </div>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        New here?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(signupNext)}`}
          className="font-medium text-[var(--accent)] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader fullScreen label="Loading…" />}>
      <LoginForm />
    </Suspense>
  );
}
