"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import PasswordField from "@/components/auth/PasswordField";
import PageLoader from "@/components/ui/PageLoader";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/lib/api/types";

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

function SignupForm() {
  const { register, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      const dest = !user.phoneNumber
        ? `/complete-profile?next=${encodeURIComponent(next)}`
        : next;
      router.replace(dest);
    }
  }, [authLoading, user, router, next]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const created = await register({
        fullName,
        email,
        phoneNumber,
        password,
        confirmPassword,
      });
      const dest = !created.phoneNumber
        ? `/complete-profile?next=${encodeURIComponent(next)}`
        : next;
      router.replace(dest);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout title="Create account">
      <p className="section-kicker">Get started</p>
      <h1 className="section-title mt-2">Create account</h1>
      <p className="section-copy mt-3">
        Register as a user to buy cars and sell from your dashboard.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error ? <p className="form-error">{error}</p> : null}

        <div className="field">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="phoneNumber">Phone number</label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            autoComplete="tel"
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="btn-primary min-w-[8rem] flex-1"
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Sign up"}
          </button>
          <GoogleSignInButton
            next={next}
            onError={(message) => setError(message)}
            className="flex-1"
          />
        </div>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-medium text-[var(--accent)] hover:underline"
        >
          Login
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<PageLoader fullScreen label="Loading…" />}>
      <SignupForm />
    </Suspense>
  );
}
