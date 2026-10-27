"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ListingCard from "@/components/cars/ListingCard";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import ListingDetailModal from "@/components/dashboard/ListingDetailModal";
import ListingFormModal from "@/components/dashboard/ListingFormModal";
import StatusEditModal from "@/components/dashboard/StatusEditModal";
import PageLoader from "@/components/ui/PageLoader";
import { ListingIcon, RefreshIcon } from "@/components/ui/NavIcons";
import {
  deleteListing,
  getListingById,
  getMyListings,
  updateListingStatus,
} from "@/lib/api/listings";
import { ApiError, type ListingStatus, type MyListing } from "@/lib/api/types";

const STATUS_FILTERS: { label: string; value: ListingStatus }[] = [
  { label: "Active", value: "Live" },
  { label: "Sold", value: "Sold" },
  { label: "Draft", value: "Draft" },
  { label: "Paused", value: "Paused" },
];

function listingCityText(listing: MyListing) {
  if (typeof listing.city === "object" && listing.city?.name) {
    return listing.city.name;
  }
  return listing.state || "";
}

function matchesSearch(listing: MyListing, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    listing.make,
    listing.model,
    listingCityText(listing),
    listing.state,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export default function DashboardListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [statusFilter, setStatusFilter] = useState<ListingStatus>("Live");
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<MyListing | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<MyListing | null>(null);

  const [confirmEdit, setConfirmEdit] = useState<MyListing | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MyListing | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<MyListing | null>(null);
  const [statusEditTarget, setStatusEditTarget] = useState<MyListing | null>(
    null
  );
  const [deletePending, setDeletePending] = useState(false);

  const loadListings = useCallback(
    async (kind: "load" | "refresh") => {
      if (kind === "refresh") setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await getMyListings();
        setListings(res.listings);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login?next=/dashboard/listings");
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load listings");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void loadListings("load");
  }, [loadListings]);

  const filtered = useMemo(
    () =>
      listings.filter(
        (item) =>
          item.status === statusFilter && matchesSearch(item, searchQuery)
      ),
    [listings, statusFilter, searchQuery]
  );

  function applySearch() {
    setSearchQuery(searchDraft);
  }

  function upsertListing(listing: MyListing) {
    setListings((prev) => {
      const without = prev.filter((item) => item._id !== listing._id);
      return [listing, ...without];
    });
    setDetail((prev) => (prev?._id === listing._id ? listing : prev));
    setEditTarget((prev) => (prev?._id === listing._id ? listing : prev));
    setStatusEditTarget((prev) =>
      prev?._id === listing._id ? listing : prev
    );
    setActionError(null);
  }

  async function openDetail(listing: MyListing) {
    setDetail(listing);
    setDetailOpen(true);
    try {
      const res = await getListingById(listing._id);
      setDetail(res.listing);
    } catch {
      // keep list snapshot
    }
  }

  function requestEdit(listing: MyListing) {
    setConfirmEdit(listing);
    setActionError(null);
  }

  function proceedEdit() {
    if (!confirmEdit) return;
    setEditTarget(confirmEdit);
    setModalMode("edit");
    setModalOpen(true);
    setConfirmEdit(null);
    setDetailOpen(false);
  }

  function requestDelete(listing: MyListing) {
    setConfirmDelete(listing);
    setActionError(null);
  }

  function requestStatusEdit(listing: MyListing) {
    setConfirmStatus(listing);
    setActionError(null);
  }

  function proceedStatusEdit() {
    if (!confirmStatus) return;
    setStatusEditTarget(confirmStatus);
    setConfirmStatus(null);
  }

  async function proceedDelete() {
    if (!confirmDelete) return;
    setDeletePending(true);
    setActionError(null);
    try {
      await deleteListing(confirmDelete._id);
      setListings((prev) => prev.filter((item) => item._id !== confirmDelete._id));
      if (detail?._id === confirmDelete._id) {
        setDetailOpen(false);
        setDetail(null);
      }
      setConfirmDelete(null);
      toast.success("Listing deleted");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Failed to delete listing. Only Draft listings can be deleted.";
      setActionError(msg);
      toast.error(msg);
      setConfirmDelete(null);
    } finally {
      setDeletePending(false);
    }
  }

  async function handleStatusChange(listing: MyListing, status: ListingStatus) {
    if (listing.status === status) {
      setStatusEditTarget(null);
      return;
    }
    setStatusPendingId(listing._id);
    setActionError(null);
    try {
      const res = await updateListingStatus(listing._id, status);
      upsertListing(res.listing);
      setStatusEditTarget(null);
      toast.success("Status updated");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to update listing status";
      setActionError(msg);
      toast.error(msg);
    } finally {
      setStatusPendingId(null);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        icon={ListingIcon}
        title="Your listings"
        description="Cars you have listed on the marketplace. Create a new listing, filter by status, and open any card for full details."
      >
        <div className="flex shrink-0 flex-col items-end gap-2.5">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setModalMode("create");
              setEditTarget(null);
              setModalOpen(true);
              setActionError(null);
            }}
          >
            Create
          </button>
          <div className="flex flex-wrap justify-end gap-1.5">
            {STATUS_FILTERS.map((filter) => {
              const active = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`min-h-8 rounded px-2.5 py-1 text-xs font-semibold transition ${
                    active
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--accent)]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--accent)] transition-transform duration-150 hover:text-[var(--accent-strong)] active:scale-90 active:rotate-45 disabled:opacity-60"
            onClick={() => void loadListings("refresh")}
            disabled={refreshing || loading}
            aria-label={refreshing ? "Refreshing" : "Refresh"}
            title={refreshing ? "Refreshing…" : "Refresh"}
          >
            <RefreshIcon
              className={`h-5 w-5 shrink-0 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </DashboardPageHeader>

      <div className="mt-5 flex w-full max-w-[50%] flex-wrap items-center gap-2">
        <input
          type="search"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applySearch();
            }
          }}
          placeholder="Search make, model, or city"
          aria-label="Search listings by make, model, or city"
          className="min-h-9 min-w-0 flex-1 rounded border border-[var(--line)] bg-white px-3 py-1.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
        <button
          type="button"
          className="btn-primary shrink-0 whitespace-nowrap px-3 py-2 text-sm"
          onClick={applySearch}
        >
          Search the listing
        </button>
      </div>

      {error ? <p className="form-error mt-6 max-w-xl">{error}</p> : null}
      {actionError ? <p className="form-error mt-4 max-w-xl">{actionError}</p> : null}

      {loading ? (
        <PageLoader className="mt-8" label="Loading listings…" />
      ) : null}

      {!loading && !error ? (
        filtered.length === 0 ? (
          <p className="mt-10 text-[var(--muted)]">
            No {statusFilter === "Live" ? "active" : statusFilter.toLowerCase()}{" "}
            listings
            {searchQuery.trim() ? " match your search" : " yet"}.
            {statusFilter === "Draft" && !searchQuery.trim()
              ? " Use Create to add one."
              : null}
          </p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                variant="seller"
                statusPending={statusPendingId === listing._id}
                onOpen={() => openDetail(listing)}
                onEdit={() => requestEdit(listing)}
                onDelete={() => requestDelete(listing)}
                onStatusClick={() => requestStatusEdit(listing)}
              />
            ))}
          </ul>
        )
      ) : null}

      <ListingFormModal
        open={modalOpen}
        mode={modalMode}
        listing={modalMode === "edit" ? editTarget : null}
        onClose={() => setModalOpen(false)}
        onSuccess={upsertListing}
      />

      <ListingDetailModal
        open={detailOpen}
        listing={detail}
        onClose={() => setDetailOpen(false)}
        onEdit={() => {
          if (detail) requestEdit(detail);
        }}
      />

      <ConfirmModal
        open={Boolean(confirmEdit)}
        title="Edit listing?"
        message="Do you want to edit this listing? You can update details and photos in the next step."
        confirmLabel="Yes, edit"
        onConfirm={proceedEdit}
        onCancel={() => setConfirmEdit(null)}
      />

      <ConfirmModal
        open={Boolean(confirmStatus)}
        title="Update listing status?"
        message="Do you want to change the status badge for this listing?"
        confirmLabel="Yes, update"
        onConfirm={proceedStatusEdit}
        onCancel={() => setConfirmStatus(null)}
      />

      <StatusEditModal
        open={Boolean(statusEditTarget)}
        currentStatus={statusEditTarget?.status ?? "Draft"}
        pending={
          statusEditTarget
            ? statusPendingId === statusEditTarget._id
            : false
        }
        onSave={(status) => {
          if (statusEditTarget) {
            void handleStatusChange(statusEditTarget, status);
          }
        }}
        onCancel={() => setStatusEditTarget(null)}
      />

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title="Delete listing?"
        message={
          confirmDelete?.status === "Draft"
            ? "Delete this draft listing permanently? This cannot be undone."
            : "Only Draft listings can be deleted. Pause or mark Sold instead, or set status to Draft first."
        }
        confirmLabel={confirmDelete?.status === "Draft" ? "Delete" : "OK"}
        danger={confirmDelete?.status === "Draft"}
        pending={deletePending}
        onConfirm={() => {
          if (confirmDelete?.status === "Draft") {
            void proceedDelete();
          } else {
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
