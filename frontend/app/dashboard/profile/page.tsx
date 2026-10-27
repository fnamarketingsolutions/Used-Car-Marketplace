"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { SettingsIcon } from "@/components/ui/NavIcons";
import { updatePhone } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/lib/api/types";

export default function DashboardProfilePage() {
  const { user, setUser, refreshUser } = useAuth();
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return null;
  }

  const notificationEntries = Object.entries(user.notificationSettings || {});
  const needsPasswordConfirm = !user.googleConnected;
  const missingPhone = !user.phoneNumber;

  async function onSavePhone(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await updatePhone({
        phoneNumber: phoneNumber.trim(),
        ...(needsPasswordConfirm ? { password } : {}),
      });
      setUser(res.user);
      await refreshUser();
      setSuccess(res.message || "Phone updated");
      setPhoneOpen(false);
      setPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update phone");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        icon={SettingsIcon}
        title="Account setting"
        description="Your account profile and notification preferences."
      />

      {missingPhone ? (
        <p className="form-error mt-6 max-w-xl">
          Add a phone number to finish your profile. Buyers and sellers use it to
          contact you.
        </p>
      ) : null}
      {success ? <p className="form-success mt-4 max-w-xl">{success}</p> : null}

      <section className="mt-8 max-w-xl rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--ink)]">Profile</h2>
        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Full name</dt>
            <dd className="mt-1 font-medium text-[var(--ink)]">{user.fullName}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Email</dt>
            <dd className="mt-1 font-medium text-[var(--ink)]">{user.email}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Phone</dt>
            <dd className="mt-1 font-medium text-[var(--ink)]">
              {user.phoneNumber || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Google</dt>
            <dd className="mt-1 font-medium text-[var(--ink)]">
              {user.googleConnected ? "Connected" : "Not connected"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Role</dt>
            <dd className="mt-1 font-medium capitalize text-[var(--ink)]">
              {user.role}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Account status</dt>
            <dd className="mt-1 font-medium capitalize text-[var(--ink)]">
              {user.accountStatus}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[var(--ink)]">
                {missingPhone ? "Add phone number" : "Update phone number"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Required for marketplace contact.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={phoneOpen}
              className={`relative h-7 w-12 rounded-full transition ${
                phoneOpen ? "bg-[var(--accent)]" : "bg-[var(--line)]"
              }`}
              onClick={() => {
                setPhoneOpen((v) => !v);
                setError(null);
                setPhoneNumber(user.phoneNumber || "");
              }}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                  phoneOpen ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {phoneOpen ? (
            <form onSubmit={onSavePhone} className="mt-4 space-y-4">
              {error ? <p className="form-error">{error}</p> : null}
              <div className="field">
                <label htmlFor="profile-phone">Phone number</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  autoComplete="tel"
                />
              </div>
              {needsPasswordConfirm ? (
                <div className="field">
                  <label htmlFor="profile-password">Current password</label>
                  <input
                    id="profile-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              ) : (
                <p className="text-xs text-[var(--muted)]">
                  Google accounts can update phone without a password.
                </p>
              )}
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? "Saving…" : "Save phone"}
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <section className="mt-6 max-w-xl rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--ink)]">Notifications</h2>
        {notificationEntries.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No notification preferences loaded yet. Defaults apply until you update
            them.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {notificationEntries.map(([key, value]) => (
              <li
                key={key}
                className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-2 last:border-0"
              >
                <span className="text-[var(--muted)]">{formatKey(key)}</span>
                <span className="font-medium text-[var(--ink)]">
                  {typeof value === "boolean"
                    ? value
                      ? "On"
                      : "Off"
                    : String(value)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn-ghost">
          Back to homepage
        </Link>
      </div>
    </div>
  );
}

function formatKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}
