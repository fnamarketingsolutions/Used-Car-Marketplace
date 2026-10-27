"use client";

import { useEffect, useState } from "react";
import type { ListingStatus } from "@/lib/api/types";

const STATUS_OPTIONS: { label: string; value: ListingStatus }[] = [
  { label: "Active", value: "Live" },
  { label: "Draft", value: "Draft" },
  { label: "Paused", value: "Paused" },
  { label: "Sold", value: "Sold" },
];

type StatusEditModalProps = {
  open: boolean;
  currentStatus: ListingStatus;
  pending?: boolean;
  onSave: (status: ListingStatus) => void;
  onCancel: () => void;
};

export default function StatusEditModal({
  open,
  currentStatus,
  pending = false,
  onSave,
  onCancel,
}: StatusEditModalProps) {
  const [selected, setSelected] = useState<ListingStatus>(currentStatus);

  useEffect(() => {
    if (open) setSelected(currentStatus);
  }, [open, currentStatus]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-edit-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="status-edit-title" className="text-lg font-bold text-[var(--ink)]">
          Update status
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Choose a new status for this listing.
        </p>
        <div className="mt-4">
          <label htmlFor="status-edit-select" className="sr-only">
            Listing status
          </label>
          <select
            id="status-edit-select"
            value={selected}
            disabled={pending}
            className="w-full rounded border border-[var(--line)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--accent)] disabled:opacity-60"
            onChange={(e) => setSelected(e.target.value as ListingStatus)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onSave(selected)}
            disabled={pending}
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
