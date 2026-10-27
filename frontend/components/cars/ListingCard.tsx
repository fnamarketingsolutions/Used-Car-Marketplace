"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/AuthProvider";
import { saveCar, unsaveCar } from "@/lib/api/dashboard";
import type { ListingStatus, MyListing, PublicListing } from "@/lib/api/types";
import { publicVehicleHref } from "@/lib/seo/usedCarsUrls";

const SELLER_STATUS_OPTIONS: { label: string; value: ListingStatus }[] = [
  { label: "Active", value: "Live" },
  { label: "Draft", value: "Draft" },
  { label: "Paused", value: "Paused" },
  { label: "Sold", value: "Sold" },
];

export function formatInr(amount?: number | null) {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatKm(km?: number | null) {
  if (km == null || Number.isNaN(km)) return "—";
  return `${new Intl.NumberFormat("en-IN").format(km)} km`;
}

export function listingToCardFields(listing: MyListing | PublicListing) {
  const primaryImage =
    "primaryImage" in listing && listing.primaryImage
      ? listing.primaryImage
      : (listing as MyListing).photos?.front?.url || null;

  return {
    _id: listing._id ?? null,
    make: listing.make,
    model: listing.model,
    manufacturingYear: listing.manufacturingYear,
    fuelType: listing.fuelType,
    transmission: listing.transmission,
    kilometresDriven: listing.kilometresDriven,
    askingPrice: listing.askingPrice,
    slug: listing.slug,
    path: "path" in listing ? listing.path : null,
    primaryImage,
    status: "status" in listing ? listing.status : undefined,
  };
}

type ListingCardProps = {
  listing: MyListing | PublicListing;
  variant?: "public" | "seller";
  saved?: boolean;
  statusPending?: boolean;
  onSavedChange?: (saved: boolean) => void;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusClick?: () => void;
};

export default function ListingCard({
  listing,
  variant = "public",
  saved = false,
  statusPending = false,
  onSavedChange,
  onOpen,
  onEdit,
  onDelete,
  onStatusClick,
}: ListingCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [savePending, setSavePending] = useState(false);
  const [isSaved, setIsSaved] = useState(saved);

  useEffect(() => {
    setIsSaved(saved);
  }, [saved]);

  const fields = listingToCardFields(listing);
  const name =
    [fields.make, fields.model].filter(Boolean).join(" ") || "Vehicle";
  const href =
    publicVehicleHref({
      make: fields.make,
      model: fields.model,
      year: fields.manufacturingYear,
      listingSlug: fields.slug,
      path: fields.path,
    }) || "/buy";
  const image =
    fields.primaryImage ||
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";

  const statusValue =
    fields.status &&
    SELLER_STATUS_OPTIONS.some((opt) => opt.value === fields.status)
      ? fields.status
      : "Draft";
  const statusLabel =
    SELLER_STATUS_OPTIONS.find((opt) => opt.value === statusValue)?.label ??
    statusValue;

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!fields._id) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(href)}`);
      return;
    }
    setSavePending(true);
    try {
      if (isSaved) {
        await unsaveCar(fields._id);
        setIsSaved(false);
        onSavedChange?.(false);
        toast.success("Removed from saved");
      } else {
        await saveCar(fields._id);
        setIsSaved(true);
        onSavedChange?.(true);
        toast.success("Saved to your list");
      }
    } catch {
      toast.error(isSaved ? "Failed to unsave" : "Failed to save");
    } finally {
      setSavePending(false);
    }
  }

  const body = (
    <>
      <div className="relative aspect-[16/10] bg-[var(--surface)]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {variant === "public" ? (
          <button
            type="button"
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[var(--accent)] shadow-sm transition hover:scale-105 disabled:opacity-50"
            aria-label={isSaved ? "Unsave car" : "Save car"}
            disabled={savePending || !fields._id}
            onClick={toggleSave}
          >
            <BookmarkIcon filled={isSaved} />
          </button>
        ) : null}
        {variant === "seller" ? (
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              type="button"
              disabled={statusPending}
              className="inline-flex min-h-8 items-center rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[var(--ink)] shadow-sm ring-1 ring-black/5 transition hover:bg-white disabled:opacity-60"
              aria-label={`Update status: ${statusLabel}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onStatusClick?.();
              }}
            >
              {statusLabel}
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[var(--ink)] shadow-sm transition hover:text-[var(--accent)]"
              aria-label="Edit listing"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit?.();
              }}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#9b1c1c] shadow-sm transition hover:bg-[#fff5f5]"
              aria-label="Delete listing"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.();
              }}
            >
              <TrashIcon />
            </button>
          </div>
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-[var(--ink)]">{name}</h3>
          <p className="shrink-0 font-bold text-[var(--accent)]">
            {formatInr(fields.askingPrice)}
          </p>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Build year: {fields.manufacturingYear ?? "—"}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3 text-xs text-[var(--muted)] sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <FuelIcon />
            {fields.fuelType || "—"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GearIcon />
            {fields.transmission || "—"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <OdoIcon />
            {formatKm(fields.kilometresDriven)}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <li className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      {variant === "seller" ? (
        <button
          type="button"
          className="block w-full text-left"
          onClick={onOpen}
        >
          {body}
        </button>
      ) : (
        <Link href={href} className="block">
          {body}
        </Link>
      )}
    </li>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M7 4h10v17l-5-3-5 3V4Z" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" strokeLinejoin="round" />
      <path d="m13 7 4 4" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FuelIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M7 4h7v12H7V4Z" />
      <path d="M14 8h2.5a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2" strokeLinecap="round" />
      <path d="M7 16v4h7v-4" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" strokeLinecap="round" />
    </svg>
  );
}

function OdoIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M7 12h2M11 12h2M15 12h2" strokeLinecap="round" />
    </svg>
  );
}
