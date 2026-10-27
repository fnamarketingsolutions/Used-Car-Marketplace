"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { requestCity } from "@/lib/api/locations";
import { ApiError, type LocationState } from "@/lib/api/types";

const OTHER_STATE = "__other__";

type LocationRequestModalProps = {
  open: boolean;
  states: LocationState[];
  onClose: () => void;
  onSuccess: () => void;
};

export default function LocationRequestModal({
  open,
  states,
  onClose,
  onSuccess,
}: LocationRequestModalProps) {
  const titleId = useId();
  const [cityName, setCityName] = useState("");
  const [stateId, setStateId] = useState("");
  const [otherStateName, setOtherStateName] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCityName("");
    setStateId("");
    setOtherStateName("");
    setReason("");
    setFormError(null);
    setSubmitting(false);
  }, [open]);

  if (!open) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmedCity = cityName.trim();
    const trimmedReason = reason.trim();
    if (!trimmedCity) {
      setFormError("City name is required");
      return;
    }
    if (!stateId) {
      setFormError("Please select a state");
      return;
    }
    if (!trimmedReason) {
      setFormError("Please provide a reason");
      return;
    }

    setSubmitting(true);
    try {
      if (stateId === OTHER_STATE) {
        const trimmedState = otherStateName.trim();
        if (!trimmedState) {
          setFormError("Please enter the new state name");
          setSubmitting(false);
          return;
        }
        await requestCity({
          cityName: trimmedCity,
          isOther: true,
          stateName: trimmedState,
          reason: trimmedReason,
        });
      } else {
        await requestCity({
          cityName: trimmedCity,
          stateId,
          reason: trimmedReason,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Failed to submit request"
      );
    } finally {
      setSubmitting(false);
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
        aria-labelledby={titleId}
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-bold text-[var(--ink)]">
          Request a location
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Ask admin to add a city (and optionally a new state) so you can use it
          in listings.
        </p>

        <form onSubmit={onSubmit} className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="field sm:col-span-2">
            <label htmlFor="loc-req-state">State</label>
            <select
              id="loc-req-state"
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
              required
            >
              <option value="">Select state</option>
              {states.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
              <option value={OTHER_STATE}>Other (new state)</option>
            </select>
          </div>
          {stateId === OTHER_STATE ? (
            <div className="field sm:col-span-2">
              <label htmlFor="loc-req-other-state">New state name</label>
              <input
                id="loc-req-other-state"
                value={otherStateName}
                onChange={(e) => setOtherStateName(e.target.value)}
                placeholder="e.g. Goa"
                required
              />
            </div>
          ) : null}
          <div className="field sm:col-span-2">
            <label htmlFor="loc-req-city">City name</label>
            <input
              id="loc-req-city"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g. Mumbai"
              required
            />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="loc-req-reason">Reason</label>
            <textarea
              id="loc-req-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need this location?"
              required
            />
          </div>
          {formError ? (
            <p className="form-error sm:col-span-2">{formError}</p>
          ) : null}
          <div className="sm:col-span-2 flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
