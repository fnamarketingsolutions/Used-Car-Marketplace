"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/AuthProvider";
import { saveCar, unsaveCar } from "@/lib/api/dashboard";
import type { PublicListing } from "@/lib/api/types";
import { formatInr, formatKm } from "@/components/cars/ListingCard";
import ContactSellerModal from "@/components/cars/ContactSellerModal";
import ReportListingModal from "@/components/cars/ReportListingModal";

function collectPhotos(listing: PublicListing): string[] {
  const photos = listing.photos || {};
  const slots = [
    "front",
    "rear",
    "leftSide",
    "rightSide",
    "interior",
    "dashboard",
    "odometer",
    "engine",
  ] as const;
  const urls: string[] = [];
  for (const slot of slots) {
    const photo = photos[slot];
    if (photo && !Array.isArray(photo) && photo.url) urls.push(photo.url);
  }
  const other = photos.other;
  if (Array.isArray(other)) {
    for (const photo of other) {
      if (photo?.url) urls.push(photo.url);
    }
  }
  if (listing.primaryImage && !urls.includes(listing.primaryImage)) {
    urls.unshift(listing.primaryImage);
  }
  return urls.length
    ? urls
    : [
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80",
      ];
}

function digitsOnly(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

type PublicListingDetailProps = {
  listing: PublicListing;
  initiallySaved?: boolean;
};

export default function PublicListingDetail({
  listing,
  initiallySaved = false,
}: PublicListingDetailProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const images = useMemo(() => collectPhotos(listing), [listing]);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(initiallySaved);
  const [savePending, setSavePending] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const title =
    [listing.manufacturingYear, listing.make, listing.model, listing.variant]
      .filter(Boolean)
      .join(" ") || "Vehicle";
  const location =
    [listing.city?.name, listing.state].filter(Boolean).join(", ") || "—";
  const phone =
    user && listing.seller?.phoneVisible ? listing.seller.phoneNumber : null;
  const wa = digitsOnly(phone);
  const listingId = listing._id || "";
  const loginNext = `/login?next=${encodeURIComponent(pathname || "/buy")}`;
  const isOwnListing =
    Boolean(user?.id) &&
    Boolean(listing.seller?._id) &&
    String(user?.id) === String(listing.seller?._id);
  const canReport = Boolean(user && listingId && !isOwnListing);

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
    { label: "Condition", value: listing.overallCondition || "—" },
    { label: "RC", value: listing.rcAvailability || "—" },
    { label: "Car location", value: location },
  ];

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }
  function next() {
    setIndex((i) => (i + 1) % images.length);
  }

  async function toggleSave() {
    if (!listingId) return;
    if (!user) {
      router.push(loginNext);
      return;
    }
    setSavePending(true);
    try {
      if (saved) {
        await unsaveCar(listingId);
        setSaved(false);
        toast.success("Removed from saved");
      } else {
        await saveCar(listingId);
        setSaved(true);
        toast.success("Saved to your list");
      }
    } catch {
      toast.error(saved ? "Failed to unsave" : "Failed to save");
    } finally {
      setSavePending(false);
    }
  }

  function onContactClick() {
    if (!user) {
      router.push(loginNext);
      return;
    }
    if (!listingId) return;
    setContactOpen(true);
  }

  function onReportClick() {
    if (!user) {
      router.push(loginNext);
      return;
    }
    if (!listingId || isOwnListing) return;
    setReportOpen(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          Home
        </Link>
        {" · "}
        <Link href="/buy" className="hover:text-[var(--accent)]">
          Buy
        </Link>
        {" · "}
        <span className="text-[var(--ink)]">{title}</span>
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[var(--surface)]">
            <Image
              src={images[index]}
              alt={`${title} photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={prev}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={next}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/60"
                >
                  ›
                </button>
              </>
            ) : null}
            <span className="absolute bottom-3 right-3 rounded bg-black/55 px-2 py-1 text-xs font-medium text-white">
              {index + 1}/{images.length}
            </span>
          </div>

          {images.length > 1 ? (
            <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <li key={`${src}-${i}`} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`relative h-16 w-20 overflow-hidden rounded border-2 ${
                      i === index
                        ? "border-[var(--accent)]"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Side panel */}
        <aside>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-bold text-[var(--ink)] sm:text-3xl">
              {title}
            </h1>
            <button
              type="button"
              aria-label={saved ? "Unsave" : "Save"}
              disabled={savePending || !listingId}
              onClick={toggleSave}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--accent)] hover:border-[var(--accent)] disabled:opacity-50"
            >
              <BookmarkIcon filled={saved} />
            </button>
          </div>

          <p className="mt-3 text-sm text-[var(--muted)]">
            {[formatKm(listing.kilometresDriven), listing.fuelType, listing.transmission]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">{location}</p>

          <p className="mt-5 text-3xl font-bold text-[var(--accent)]">
            {formatInr(listing.askingPrice)}
          </p>
          {listing.negotiable ? (
            <p className="mt-1 text-sm text-[var(--muted)]">Price negotiable</p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {!user ? (
              <Link href={loginNext} className="btn-primary min-w-[10rem]">
                Contact
              </Link>
            ) : (
              <button
                type="button"
                className="btn-primary min-w-[10rem]"
                onClick={onContactClick}
                disabled={!listingId}
              >
                Contact seller
              </button>
            )}

            {wa ? (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded border border-[#25D366] bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                aria-label="WhatsApp seller"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            ) : null}

            {canReport ? (
              <button
                type="button"
                className="btn-ghost min-w-[10rem]"
                onClick={onReportClick}
              >
                Report
              </button>
            ) : null}

            {!user ? (
              <Link href={loginNext} className="btn-ghost min-w-[10rem]">
                Report
              </Link>
            ) : null}
          </div>

          {user && phone ? (
            <p className="mt-4 text-sm text-[var(--ink)]">
              Seller phone:{" "}
              <a
                href={`tel:${phone}`}
                className="font-semibold text-[var(--accent)]"
              >
                {phone}
              </a>
            </p>
          ) : null}

          {user && !phone ? (
            <p className="mt-3 text-xs text-[var(--muted)]">
              Phone is hidden by the seller. Send an inquiry to get in touch.
            </p>
          ) : null}

          {!user ? (
            <p className="mt-3 text-xs text-[var(--muted)]">
              Log in to see the seller number (when shared) and send an inquiry.
            </p>
          ) : null}
        </aside>
      </div>

      {/* Below: overview */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-[var(--accent)]">Reasons to buy</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          <li className="flex gap-3 rounded-xl border border-[var(--line)] bg-white p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,white)] text-[var(--accent)]">
              ₹
            </span>
            <div>
              <p className="font-semibold text-[var(--ink)]">Clear asking price</p>
              <p className="text-sm text-[var(--muted)]">
                Listed at {formatInr(listing.askingPrice)}
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-[var(--line)] bg-white p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,white)] text-[var(--accent)]">
              ◈
            </span>
            <div>
              <p className="font-semibold text-[var(--ink)]">Usage shared upfront</p>
              <p className="text-sm text-[var(--muted)]">
                {formatKm(listing.kilometresDriven)} · {listing.fuelType || "Fuel n/a"}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-[var(--accent)]">Car overview</h2>
        <div className="mt-4 rounded-xl border border-[var(--line)] bg-white p-5">
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="mt-10 pb-8">
        <h2 className="text-xl font-bold text-[var(--accent)]">Condition report</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoCard label="Accident history" value={listing.accidentHistory} />
          <InfoCard label="Service history" value={listing.serviceHistory} />
          <InfoCard
            label="Loan / hypothecation"
            value={listing.loanHypothecationStatus}
          />
          <InfoCard
            label="Additional information"
            value={listing.additionalInformation}
          />
        </dl>
      </section>

      {listingId ? (
        <ContactSellerModal
          open={contactOpen}
          listingId={listingId}
          listingLabel={title}
          onClose={() => setContactOpen(false)}
        />
      ) : null}

      {listingId ? (
        <ReportListingModal
          open={reportOpen}
          listingId={listingId}
          listingLabel={title}
          onClose={() => setReportOpen(false)}
          onSuccess={() => toast.success("Report submitted")}
        />
      ) : null}
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-white p-4">
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[var(--ink)]">{value || "—"}</dd>
    </div>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="h-5 w-5"
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

function WhatsAppIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.82c0 1.96.52 3.8 1.44 5.4L2 22l4.96-1.54a9.86 9.86 0 0 0 5.08 1.38h.01c5.46 0 9.89-4.4 9.89-9.82C21.94 6.4 17.5 2 12.04 2Zm5.74 13.95c-.24.67-1.38 1.23-1.91 1.31-.49.07-1.11.1-1.79-.11-.41-.13-.94-.3-1.62-.59-2.85-1.23-4.7-4.1-4.84-4.29-.14-.19-1.13-1.5-1.13-2.86 0-1.36.71-2.03.96-2.31.25-.28.54-.35.72-.35h.52c.17 0 .4-.06.62.47.24.58.8 2 .87 2.14.07.14.12.31.02.5-.1.19-.15.31-.3.48-.14.17-.31.37-.44.5-.14.14-.29.29-.12.56.17.28.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.29 1.41.28.14.44.12.6-.07.17-.19.7-.81.89-1.09.19-.28.38-.23.64-.14.26.1 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.69-.17 1.36Z" />
    </svg>
  );
}
