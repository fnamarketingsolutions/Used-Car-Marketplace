"use client";

import { useState } from "react";
import { createInquiry } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/types";

type ContactSellerModalProps = {
  open: boolean;
  listingId: string;
  listingLabel: string;
  onClose: () => void;
};

export default function ContactSellerModal({
  open,
  listingId,
  listingLabel,
  onClose,
}: ContactSellerModalProps) {
  const [message, setMessage] = useState(
    `Hi, I'm interested in your ${listingLabel}. Is it still available?`
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await createInquiry({
        listingId,
        message: message.trim(),
      });
      setSuccess(res.message || "Inquiry sent");
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1200);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to send inquiry"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-seller-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="contact-seller-title"
          className="text-lg font-bold text-[var(--ink)]"
        >
          Contact seller
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Send a message about {listingLabel}.
        </p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="inquiry-message">Message</label>
            <textarea
              id="inquiry-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={5}
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
              {pending ? "Sending…" : "Send inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
