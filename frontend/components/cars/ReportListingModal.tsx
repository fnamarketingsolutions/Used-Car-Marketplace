"use client";

import { useState } from "react";
import {
  createReport,
  type ReportCategory,
} from "@/lib/api/reports";
import { ApiError } from "@/lib/api/types";

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "fraud", label: "Fraud" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "other", label: "Other" },
];

type ReportListingModalProps = {
  open: boolean;
  listingId: string;
  listingLabel: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ReportListingModal({
  open,
  listingId,
  listingLabel,
  onClose,
  onSuccess,
}: ReportListingModalProps) {
  const [category, setCategory] = useState<ReportCategory>("spam");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please write a reason for this report.");
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await createReport({
        targetType: "listing",
        listingId,
        category,
        reason: reason.trim(),
      });
      setSuccess(res.message || "Report submitted");
      onSuccess?.();
      setTimeout(() => {
        onClose();
        setSuccess(null);
        setReason("");
        setCategory("spam");
      }, 1000);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to submit report"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onClick={() => !pending && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-listing-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="report-listing-title"
          className="text-lg font-bold text-[var(--ink)]"
        >
          Report listing
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Tell us why you are reporting {listingLabel}. Our team will review it.
        </p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="report-category">Category</label>
            <select
              id="report-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
              required
            >
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="report-reason">Reason</label>
            <textarea
              id="report-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={5}
              maxLength={2000}
              placeholder="Describe the issue…"
            />
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Submitting…" : "Submit report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
