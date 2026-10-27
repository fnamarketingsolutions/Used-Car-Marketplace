"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import PageLoader from "@/components/ui/PageLoader";
import { updatePhone } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/lib/api/types";

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

function CompleteProfileForm() {
  const { user, loading, setUser, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const needsPasswordConfirm = Boolean(user && !user.googleConnected);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(`/complete-profile?next=${next}`)}`);
      return;
    }
    if (user.phoneNumber) {
      router.replace(next);
    }
  }, [loading, user, router, next]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await updatePhone({
        phoneNumber: phoneNumber.trim(),
        ...(needsPasswordConfirm ? { password } : {}),
      });
      setUser(res.user);
      await refreshUser();
      router.replace(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save phone");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user || user.phoneNumber) {
    return <PageLoader fullScreen label="Loading…" />;
  }

  return (
    <AuthSplitLayout title="Complete profile">
      <p className="section-kicker">One more step</p>
      <h1 className="section-title mt-2">Add your phone number</h1>
      <p className="section-copy mt-3">
        Buyers and sellers need a phone number to connect. You can update it later
        in Account Setting.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error ? <p className="form-error">{error}</p> : null}

        <div className="field">
          <label htmlFor="phoneNumber">Phone number</label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            autoComplete="tel"
            placeholder="e.g. 9876543210"
          />
        </div>

        {needsPasswordConfirm ? (
          <div className="field">
            <label htmlFor="password">Current password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        ) : null}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Saving…" : "Continue"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Signed in as {user.email}.{" "}
        <Link href="/" className="font-medium text-[var(--accent)] hover:underline">
          Home
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<PageLoader fullScreen label="Loading…" />}>
      <CompleteProfileForm />
    </Suspense>
  );
}
