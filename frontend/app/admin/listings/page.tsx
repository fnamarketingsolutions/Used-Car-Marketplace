"use client";

import { useCallback, useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import PageLoader from "@/components/ui/PageLoader";
import {
  ListingIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/ui/NavIcons";
import {
  getAdminListingDetail,
  listAdminListings,
  removeAdminListing,
  restoreAdminListing,
  type AdminListing,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/types";
import listingImage from "../../../public/assets/adminDashboardImages/admin-listing.png";

const STATUS_FILTERS = [
  {
    value: "",
    label: "All",
    colorClass: "border-[var(--ink)] bg-[var(--ink)] text-white",
  },
  {
    value: "Draft",
    label: "Draft",
    colorClass: "border-[var(--muted)] bg-[var(--muted)] text-white",
  },
  {
    value: "Live",
    label: "Live",
    colorClass: "border-emerald-600 bg-emerald-600 text-white",
  },
  {
    value: "Paused",
    label: "Paused",
    colorClass: "border-amber-500 bg-amber-500 text-white",
  },
  {
    value: "Sold",
    label: "Sold",
    colorClass: "border-[var(--accent)] bg-[var(--accent)] text-white",
  },
  {
    value: "Expired",
    label: "Expired",
    colorClass: "border-slate-500 bg-slate-500 text-white",
  },
  {
    value: "Removed",
    label: "Removed",
    colorClass: "border-red-600 bg-red-600 text-white",
  },
] as const;

type ListingDetail = {
  listing: AdminListing & Record<string, unknown>;
  seller: {
    id?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    accountStatus?: string;
    createdAt?: string;
  } | null;
  listingStats: Record<string, number>;
};

function listingStatusBadgeClass(status?: string) {
  switch (status) {
    case "Live":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Paused":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Removed":
      return "bg-red-100 text-red-800 border-red-200";
    case "Sold":
      return "bg-[color-mix(in_oklab,var(--accent)_20%,white)] text-[var(--accent-strong)] border-[color-mix(in_oklab,var(--accent)_30%,white)]";
    case "Expired":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "Draft":
      return "bg-[var(--surface)] text-[var(--ink)] border-[var(--line)]";
    default:
      return "bg-[var(--surface)] text-[var(--ink)] border-[var(--line)]";
  }
}

function formatPrice(value?: number) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function detailValue(listing: Record<string, unknown>, key: string) {
  const value = listing[key];
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [status, setStatus] = useState("");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState<{
    kind: "remove" | "restore";
    listing: AdminListing;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ListingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAdminListings({
        status: status || undefined,
        q: q.trim() || undefined,
      });
      setListings(data.listings);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load listings"
      );
    } finally {
      setLoading(false);
    }
  }, [status, q]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setDetailError(null);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);

    void getAdminListingDetail(selectedId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setDetail(null);
        setDetailError(
          err instanceof ApiError ? err.message : "Failed to load listing"
        );
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function runConfirm() {
    if (!confirm) return;
    setPending(true);
    setError(null);
    try {
      if (confirm.kind === "remove") {
        await removeAdminListing(confirm.listing._id);
      } else {
        await restoreAdminListing(confirm.listing._id);
      }
      setConfirm(null);
      if (selectedId === confirm.listing._id) {
        setSelectedId(null);
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setPending(false);
    }
  }

  const listing = detail?.listing;

  return (
    <div>
      <AdminPageHeader
        title="Listing management"
        description="Review marketplace inventory in one place—filter by status, remove problematic listings, and restore vehicles when issues are resolved so buyers always see trusted stock."
        onRefresh={load}
        refreshing={loading}
        titleIcon={<ListingIcon className="h-6 w-6" />}
        image={{
          src: listingImage.src,
          width: listingImage.width,
          height: listingImage.height,
        }}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const next = qInput.trim();
                if (next === q) void load();
                else setQ(next);
              }
            }}
            placeholder="Search make, model, seller, city"
            className="w-80 max-w-full rounded border border-[var(--line)] bg-white px-3 py-2 text-sm sm:w-[28rem] md:w-[32rem] lg:w-[36rem]"
          />
          <button
            type="button"
            className="btn-primary shrink-0 text-sm"
            onClick={() => {
              const next = qInput.trim();
              if (next === q) void load();
              else setQ(next);
            }}
          >
            Search
          </button>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {STATUS_FILTERS.map((filter) => {
            const selected = status === filter.value;
            return (
              <button
                key={filter.label}
                type="button"
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${filter.colorClass} ${
                  selected
                    ? "ring-2 ring-offset-1 ring-[var(--ink)]/30"
                    : "opacity-85 hover:opacity-100"
                }`}
                onClick={() => setStatus(filter.value)}
                aria-pressed={selected}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {error ? <p className="form-error mb-4">{error}</p> : null}

      <div className="overflow-x-auto rounded border border-[var(--line)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-xs uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2.5">Vehicle</th>
              <th className="px-3 py-2.5">Seller</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Price</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((row) => (
              <tr
                key={row._id}
                className="cursor-pointer border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[var(--surface)]"
                onClick={() => setSelectedId(row._id)}
              >
                <td className="px-3 py-3">
                  <div className="inline-flex max-w-full items-start gap-2">
                    <ListingIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--ink)]">
                        {row.make} {row.model}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {row.manufacturingYear}
                        {row.variant ? ` · ${row.variant}` : ""}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-[var(--muted)]">
                  <span className="inline-flex max-w-full items-center gap-2">
                    <UsersIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">
                      {row.seller?.fullName || "—"}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${listingStatusBadgeClass(row.status)}`}
                  >
                    <ShieldIcon className="h-3.5 w-3.5 shrink-0" />
                    {row.status || "—"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {row.askingPrice != null
                    ? `₹${Number(row.askingPrice).toLocaleString("en-IN")}`
                    : "—"}
                </td>
                <td
                  className="px-3 py-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {row.status === "Removed" ? (
                    <button
                      type="button"
                      className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:bg-[var(--surface)]"
                      onClick={() => setConfirm({ kind: "restore", listing: row })}
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="rounded border border-[#9b1c1c]/40 px-2 py-1 text-xs text-[#9b1c1c] hover:bg-red-50"
                      onClick={() => setConfirm({ kind: "remove", listing: row })}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && listings.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-[var(--muted)]"
                >
                  No listings found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {selectedId ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => setSelectedId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="listing-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="listing-detail-title"
                  className="text-lg font-bold text-[var(--ink)]"
                >
                  Listing details
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Full inventory record for admin review.
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost shrink-0 text-sm"
                onClick={() => setSelectedId(null)}
              >
                Close
              </button>
            </div>

            {detailLoading ? (
              <PageLoader label="Loading listing…" />
            ) : detailError ? (
              <p className="form-error">{detailError}</p>
            ) : listing ? (
              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 pt-5">
                  <span
                    className={`absolute right-2 top-2 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${listingStatusBadgeClass(listing.status)}`}
                  >
                    {listing.status || "Unknown"}
                  </span>
                  <p className="pr-20 text-base font-semibold text-[var(--ink)]">
                    {[listing.make, listing.model, listing.variant]
                      .filter(Boolean)
                      .join(" ") || "Listing"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {listing.manufacturingYear
                      ? `Year ${listing.manufacturingYear}`
                      : "Year —"}
                    {listing.city?.name
                      ? ` · ${listing.city.name}${listing.city.state ? `, ${listing.city.state}` : ""}`
                      : ""}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--accent)]">
                    {formatPrice(listing.askingPrice)}
                  </p>
                </div>

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Views", value: String(listing.viewCount ?? 0) },
                    {
                      label: "Seller",
                      value:
                        detail?.seller?.fullName ||
                        listing.seller?.fullName ||
                        "—",
                    },
                    {
                      label: "Seller email",
                      value:
                        detail?.seller?.email || listing.seller?.email || "—",
                    },
                    {
                      label: "Phone",
                      value: detail?.seller?.phoneNumber || "—",
                    },
                    {
                      label: "Account",
                      value:
                        detail?.seller?.accountStatus ||
                        listing.seller?.accountStatus ||
                        "—",
                    },
                    {
                      label: "Fuel",
                      value: detailValue(listing, "fuelType"),
                    },
                    {
                      label: "Transmission",
                      value: detailValue(listing, "transmission"),
                    },
                    {
                      label: "Body type",
                      value: detailValue(listing, "bodyType"),
                    },
                    {
                      label: "Km driven",
                      value: detailValue(listing, "kilometresDriven"),
                    },
                    {
                      label: "Owners",
                      value: detailValue(listing, "numberOfOwners"),
                    },
                    {
                      label: "Colour",
                      value: detailValue(listing, "colour"),
                    },
                    {
                      label: "Condition",
                      value: detailValue(listing, "overallCondition"),
                    },
                    {
                      label: "Created",
                      value: formatDate(listing.createdAt),
                    },
                    {
                      label: "Updated",
                      value: formatDate(listing.updatedAt),
                    },
                  ].map((field) => (
                    <div
                      key={field.label}
                      className="rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5"
                    >
                      <p className="text-xs text-[var(--muted)]">
                        {field.label}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-[var(--ink)]">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </section>

                {detailValue(listing, "additionalInformation") !== "—" ? (
                  <section className="rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
                    <p className="text-xs text-[var(--muted)]">
                      Additional information
                    </p>
                    <p className="mt-1 text-sm text-[var(--ink)]">
                      {detailValue(listing, "additionalInformation")}
                    </p>
                  </section>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.kind === "remove" ? "Remove listing" : "Restore listing"}
        message={
          confirm?.kind === "remove"
            ? "Remove this listing from the marketplace?"
            : "Restore this listing to its previous status?"
        }
        danger={confirm?.kind === "remove"}
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </div>
  );
}
