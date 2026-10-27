"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ListingCard from "@/components/cars/ListingCard";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import PageLoader from "@/components/ui/PageLoader";
import { SavedIcon } from "@/components/ui/NavIcons";
import {
  deleteSavedSearch,
  getSavedCars,
  getSavedSearches,
} from "@/lib/api/dashboard";
import { ApiError, type SavedCar, type SavedSearch } from "@/lib/api/types";

type SavedTab = "cars" | "searches";

function filtersToBuyHref(filters?: Record<string, unknown>) {
  if (!filters || Object.keys(filters).length === 0) return "/buy";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value == null) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  return query ? `/buy?${query}` : "/buy";
}

function formatFilterValue(value: unknown): string {
  if (value == null) return "—";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default function DashboardSavedPage() {
  const router = useRouter();
  const [tab, setTab] = useState<SavedTab>("cars");
  const [savedCars, setSavedCars] = useState<SavedCar[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [carsRes, searchesRes] = await Promise.all([
        getSavedCars(),
        getSavedSearches(),
      ]);
      const cars = carsRes.savedCars.filter((item) => item.listing);
      setSavedCars(cars);
      setSavedSearches(searchesRes.savedSearches);
      setSelectedSearchId((current) => {
        if (
          current &&
          searchesRes.savedSearches.some((item) => item._id === current)
        ) {
          return current;
        }
        return searchesRes.savedSearches[0]?._id ?? null;
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login?next=/dashboard/saved");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Failed to load saved items");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const selectedSearch = useMemo(
    () => savedSearches.find((item) => item._id === selectedSearchId) ?? null,
    [savedSearches, selectedSearchId]
  );

  async function handleDeleteSearch() {
    if (!selectedSearch) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await deleteSavedSearch(selectedSearch._id);
      const next = savedSearches.filter((item) => item._id !== selectedSearch._id);
      setSavedSearches(next);
      setSelectedSearchId(next[0]?._id ?? null);
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Failed to delete saved search"
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        icon={SavedIcon}
        title="Saved"
        description="Cars you shortlisted and searches you saved. Unsave a car to remove it from this list."
      />

      <div
        role="tablist"
        aria-label="Saved sections"
        className="mt-8 flex gap-2 border-b border-[var(--line)]"
      >
        {(
          [
            { id: "cars", label: `Saved cars (${savedCars.length})` },
            {
              id: "searches",
              label: `Saved searches (${savedSearches.length})`,
            },
          ] as const
        ).map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`px-3 py-2 text-sm transition ${
                active
                  ? "border-b-2 border-[var(--accent)] font-semibold text-[var(--ink)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
              onClick={() => {
                setTab(item.id);
                setActionError(null);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {error ? <p className="form-error mt-6 max-w-xl">{error}</p> : null}
      {actionError ? <p className="form-error mt-4 max-w-xl">{actionError}</p> : null}

      {loading ? (
        <PageLoader className="mt-8" label="Loading saved items…" />
      ) : null}

      {!loading && tab === "cars" ? (
        savedCars.length === 0 ? (
          <p className="mt-8 border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
            You have no saved cars yet.{" "}
            <Link href="/buy" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Browse cars
            </Link>{" "}
            and save ones you like.
          </p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {savedCars.map((item) => {
              if (!item.listing) return null;
              const listing = item.listing;
              return (
                <ListingCard
                  key={item._id}
                  listing={{
                    ...listing,
                    primaryImage: listing.photos?.front?.url || null,
                  }}
                  variant="public"
                  saved
                  onSavedChange={(nextSaved) => {
                    if (!nextSaved) {
                      setSavedCars((prev) =>
                        prev.filter((row) => row._id !== item._id)
                      );
                    }
                  }}
                />
              );
            })}
          </ul>
        )
      ) : null}

      {!loading && tab === "searches" ? (
        savedSearches.length === 0 ? (
          <p className="mt-8 border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
            No saved searches yet.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[16rem_1fr]">
            <ul className="space-y-1 border border-[var(--line)] bg-white p-2">
              {savedSearches.map((search) => (
                <li key={search._id}>
                  <button
                    type="button"
                    className={`w-full rounded px-3 py-2 text-left text-sm ${
                      search._id === selectedSearchId
                        ? "bg-[color-mix(in_oklab,var(--accent)_12%,white)] font-semibold text-[var(--accent)]"
                        : "text-[var(--ink)] hover:bg-[var(--surface)]"
                    }`}
                    onClick={() => setSelectedSearchId(search._id)}
                  >
                    {search.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="rounded-xl border border-[var(--line)] bg-white p-5">
              {selectedSearch ? (
                <>
                  <h2 className="text-lg font-bold text-[var(--ink)]">
                    {selectedSearch.name}
                  </h2>
                  <dl className="mt-4 space-y-2 text-sm">
                    {Object.entries(selectedSearch.filters || {}).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between gap-4">
                          <dt className="text-[var(--muted)]">{key}</dt>
                          <dd className="font-medium text-[var(--ink)]">
                            {formatFilterValue(value)}
                          </dd>
                        </div>
                      )
                    )}
                  </dl>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      href={filtersToBuyHref(selectedSearch.filters)}
                      className="btn-primary"
                    >
                      Run search
                    </Link>
                    <button
                      type="button"
                      className="btn-ghost text-[#9b1c1c]"
                      disabled={actionLoading}
                      onClick={() => void handleDeleteSearch()}
                    >
                      Delete search
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Select a saved search.
                </p>
              )}
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
