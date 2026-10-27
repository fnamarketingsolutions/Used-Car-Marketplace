"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import type { MyListing } from "@/lib/api/types";
import { formatInr, formatKm } from "@/components/cars/ListingCard";

type ListingDetailModalProps = {
  open: boolean;
  listing: MyListing | null;
  onClose: () => void;
  onEdit?: () => void;
};

const PHOTO_SLOTS = [
  "front",
  "rear",
  "leftSide",
  "rightSide",
  "interior",
  "dashboard",
  "odometer",
  "engine",
] as const;

function collectPhotos(listing: MyListing): string[] {
  const photos = listing.photos || {};
  const urls: string[] = [];
  for (const slot of PHOTO_SLOTS) {
    const photo = photos[slot];
    if (photo && !Array.isArray(photo) && photo.url) urls.push(photo.url);
  }
  const other = photos.other;
  if (Array.isArray(other)) {
    for (const photo of other) {
      if (photo?.url) urls.push(photo.url);
    }
  }
  return urls.length
    ? urls
    : [
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
      ];
}

export default function ListingDetailModal({
  open,
  listing,
  onClose,
  onEdit,
}: ListingDetailModalProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const images = useMemo(
    () => (listing ? collectPhotos(listing) : []),
    [listing]
  );

  useEffect(() => {
    if (!open) return;
    scrollerRef.current?.scrollTo({ left: 0 });
  }, [open, listing?._id]);

  if (!open || !listing) return null;

  const name =
    [listing.make, listing.model, listing.variant].filter(Boolean).join(" ") ||
    "Vehicle";

  const overview = [
    { label: "Make year", value: listing.manufacturingYear ?? "—" },
    { label: "Registration year", value: listing.registrationYear ?? "—" },
    { label: "Fuel type", value: listing.fuelType || "—" },
    { label: "Km driven", value: formatKm(listing.kilometresDriven) },
    { label: "Transmission", value: listing.transmission || "—" },
    { label: "No. of owners", value: listing.numberOfOwners ?? "—" },
    { label: "Body type", value: listing.bodyType || "—" },
    { label: "Colour", value: listing.colour || "—" },
    { label: "Insurance", value: listing.insuranceStatus || "—" },
    {
      label: "Location",
      value: [listing.city?.name, listing.state].filter(Boolean).join(", ") || "—",
    },
    { label: "Condition", value: listing.overallCondition || "—" },
    { label: "RC", value: listing.rcAvailability || "—" },
  ];

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.85, 240);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-stretch justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-detail-title"
        className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(90vh,52rem)] sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3 sm:px-5">
          <h2
            id="listing-detail-title"
            className="truncate text-base font-bold text-[var(--ink)] sm:text-lg"
          >
            {name}
          </h2>
          <button
            type="button"
            className="rounded border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[1.35fr_1fr]">
          <div className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6">
            <section>
              <h3 className="text-lg font-bold text-[var(--accent)]">Reasons to buy</h3>
              <ul className="mt-4 space-y-4">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,white)] text-[var(--accent)]">
                    <TagIcon />
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--ink)]">Clear asking price</p>
                    <p className="text-sm text-[var(--muted)]">
                      Listed at {formatInr(listing.askingPrice)}
                      {listing.negotiable ? " · Negotiable" : ""}
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,white)] text-[var(--accent)]">
                    <RoadIcon />
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--ink)]">Usage details shared</p>
                    <p className="text-sm text-[var(--muted)]">
                      {formatKm(listing.kilometresDriven)} driven ·{" "}
                      {listing.fuelType || "Fuel n/a"} ·{" "}
                      {listing.transmission || "Transmission n/a"}
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            <section className="mt-8">
              <h3 className="text-lg font-bold text-[var(--accent)]">Car overview</h3>
              <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 sm:p-5">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {overview.map((row) => (
                    <div key={row.label}>
                      <dt className="text-xs text-[var(--muted)]">{row.label}</dt>
                      <dd className="mt-1 text-sm font-semibold text-[var(--ink)]">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            <section className="mt-8 pb-6">
              <h3 className="text-lg font-bold text-[var(--accent)]">Condition report</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Details shared by the seller for this listing.
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoRow label="Accident history" value={listing.accidentHistory} />
                <InfoRow label="Service history" value={listing.serviceHistory} />
                <InfoRow label="Loan / hypothecation" value={listing.loanHypothecationStatus} />
                <InfoRow label="Additional info" value={listing.additionalInformation} />
              </dl>
            </section>
          </div>

          <aside className="flex min-h-0 shrink-0 flex-col border-t border-[var(--line)] bg-[var(--bg)] p-4 sm:p-5 lg:border-l lg:border-t-0">
            <div className="relative">
              <div
                ref={scrollerRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {images.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative aspect-[4/3] w-full min-w-full shrink-0 snap-center overflow-hidden rounded-lg bg-[var(--surface)]"
                  >
                    <Image
                      src={src}
                      alt={`${name} photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                    <span className="absolute bottom-2 right-2 rounded bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
                      {index + 1}/{images.length}
                    </span>
                  </div>
                ))}
              </div>
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60"
                    onClick={() => scrollByDir(-1)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60"
                    onClick={() => scrollByDir(1)}
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>
            <p className="mt-4 text-2xl font-bold text-[var(--accent)]">
              {formatInr(listing.askingPrice)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Status:{" "}
              <span className="font-semibold text-[var(--ink)]">{listing.status}</span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Views: {listing.viewCount ?? 0}
            </p>
            {onEdit ? (
              <button type="button" className="btn-primary mt-5 w-full" onClick={onEdit}>
                Edit listing
              </button>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-white p-3">
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[var(--ink)]">{value || "—"}</dd>
    </div>
  );
}

function TagIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" />
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RoadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 19 8 5h8l4 14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 5v14M9 12h6" strokeLinecap="round" />
    </svg>
  );
}
