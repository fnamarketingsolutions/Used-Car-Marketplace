"use client";

import type { ReactNode } from "react";
import type { MyListing } from "@/lib/api/types";
import {
  collectPhotoUrls,
  formatKm,
  formatPrice,
  listingTitle,
} from "./listingFormat";

type ListingDetailPanelProps = {
  listing: MyListing | null;
  emptyMessage?: string;
  actions?: ReactNode;
};

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 font-medium text-[var(--ink)]">{value}</dd>
    </div>
  );
}

export default function ListingDetailPanel({
  listing,
  emptyMessage = "Select an item to see details.",
  actions,
}: ListingDetailPanelProps) {
  if (!listing) {
    return (
      <p className="text-sm text-[var(--muted)]">{emptyMessage}</p>
    );
  }

  const photos = collectPhotoUrls(listing.photos);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-[var(--ink)]">
            {listingTitle(listing)}
          </h2>
          {listing.variant ? (
            <p className="mt-1 text-sm text-[var(--muted)]">{listing.variant}</p>
          ) : null}
          <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
            {formatPrice(listing.askingPrice)}
            {listing.negotiable ? (
              <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                Negotiable
              </span>
            ) : null}
          </p>
        </div>
        {actions}
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
        <DetailRow label="Status" value={listing.status} />
        <DetailRow label="Views" value={listing.viewCount ?? 0} />
        <DetailRow label="Fuel" value={listing.fuelType} />
        <DetailRow label="Transmission" value={listing.transmission} />
        <DetailRow label="Body type" value={listing.bodyType} />
        <DetailRow label="Kilometres" value={formatKm(listing.kilometresDriven)} />
        <DetailRow label="Owners" value={listing.numberOfOwners} />
        <DetailRow label="Colour" value={listing.colour} />
        <DetailRow label="Registration year" value={listing.registrationYear} />
        <DetailRow label="Condition" value={listing.overallCondition} />
        <DetailRow label="Accident history" value={listing.accidentHistory} />
        <DetailRow label="Insurance" value={listing.insuranceStatus} />
        <DetailRow label="Service history" value={listing.serviceHistory} />
        <DetailRow label="RC" value={listing.rcAvailability} />
        <DetailRow label="Loan" value={listing.loanHypothecationStatus} />
        <DetailRow
          label="Location"
          value={
            [listing.city?.name, listing.state || listing.city?.state]
              .filter(Boolean)
              .join(", ") || undefined
          }
        />
      </dl>

      {listing.additionalInformation ? (
        <div className="mt-6 border-t border-[var(--line)] pt-4">
          <h3 className="text-sm font-semibold text-[var(--ink)]">Additional information</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted)]">
            {listing.additionalInformation}
          </p>
        </div>
      ) : null}

      {photos.length > 0 ? (
        <div className="mt-6 border-t border-[var(--line)] pt-4">
          <h3 className="text-sm font-semibold text-[var(--ink)]">Photos</h3>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <li key={photo.url} className="overflow-hidden border border-[var(--line)] bg-[var(--bg)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.label}
                  className="aspect-[4/3] w-full object-cover"
                />
                <p className="px-2 py-1 text-xs text-[var(--muted)]">{photo.label}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
