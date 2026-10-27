"use client";

import type { MyListing } from "@/lib/api/types";
import { formatPrice, listingTitle } from "./listingFormat";

type ListingListItemProps = {
  listing: MyListing;
  selected: boolean;
  onSelect: () => void;
  meta?: string;
};

export default function ListingListItem({
  listing,
  selected,
  onSelect,
  meta,
}: ListingListItemProps) {
  const secondary =
    meta ??
    ([listing.status, listing.city?.name].filter(Boolean).join(" · ") || "—");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={`block w-full border-b border-[var(--line)] px-4 py-3 text-left transition last:border-b-0 ${
        selected
          ? "border-l-2 border-l-[var(--accent)] bg-[var(--surface)] pl-[calc(1rem-2px)]"
          : "hover:bg-[var(--surface)]"
      }`}
    >
      <span className="block text-sm font-semibold text-[var(--ink)]">
        {listingTitle(listing)}
      </span>
      <span className="mt-1 block text-sm text-[var(--ink)]">
        {formatPrice(listing.askingPrice)}
      </span>
      <span className="mt-0.5 block text-xs text-[var(--muted)]">{secondary}</span>
    </button>
  );
}
