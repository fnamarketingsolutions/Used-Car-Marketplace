import { Suspense } from "react";
import Link from "next/link";
import BuyFilters from "@/components/cars/BuyFilters";
import BuySearchBar from "@/components/cars/BuySearchBar";
import ListingCard from "@/components/cars/ListingCard";
import { getPublicListings } from "@/lib/api/listings";

type BuySearchParams = {
  page?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  make?: string;
  model?: string;
};

type BuyPageProps = {
  searchParams: Promise<BuySearchParams>;
};

function buildBuyHref(params: BuySearchParams, page: number) {
  const next = new URLSearchParams();
  if (params.q) next.set("q", params.q);
  if (params.minPrice) next.set("minPrice", params.minPrice);
  if (params.maxPrice) next.set("maxPrice", params.maxPrice);
  if (params.make) next.set("make", params.make);
  if (params.model) next.set("model", params.model);
  if (page > 1) next.set("page", String(page));
  const qs = next.toString();
  return qs ? `/buy?${qs}` : "/buy";
}

async function BuyListings({
  searchParams,
}: {
  searchParams: Promise<BuySearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const limit = 12;

  let listings: Awaited<ReturnType<typeof getPublicListings>>["listings"] = [];
  let totalPages = 1;
  let total = 0;
  let error: string | null = null;

  try {
    const data = await getPublicListings({
      page,
      limit,
      q: params.q,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      make: params.make,
      model: params.model,
    });
    listings = data.listings;
    totalPages = data.totalPages;
    total = data.total;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load listings";
  }

  const hasFilters = Boolean(
    params.q || params.minPrice || params.maxPrice || params.make || params.model
  );

  return (
    <>
      <p className="section-copy mt-4 max-w-2xl">
        Live inventory from sellers across the marketplace.
        {total > 0
          ? ` Showing page ${page} of ${totalPages} (${total} cars).`
          : null}
      </p>

      {error ? (
        <p className="form-error mt-10">{error}</p>
      ) : listings.length === 0 ? (
        <p className="mt-12 text-[var(--muted)]">
          {hasFilters
            ? "No listings match your search or filters."
            : "No live listings right now."}{" "}
          {!hasFilters ? (
            <>
              <Link
                href="/sell"
                className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
              >
                List your car
              </Link>{" "}
              to get started.
            </>
          ) : (
            <Link
              href="/buy"
              className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Clear filters
            </Link>
          )}
        </p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing, i) => (
            <ListingCard
              key={
                listing.slug ||
                listing.path ||
                `${listing.make}-${listing.model}-${i}`
              }
              listing={listing}
            />
          ))}
        </ul>
      )}

      {totalPages > 1 && !error ? (
        <nav
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
          aria-label="Pagination"
        >
          {page > 1 ? (
            <Link href={buildBuyHref(params, page - 1)} className="btn-ghost">
              Previous
            </Link>
          ) : (
            <span className="btn-ghost cursor-not-allowed opacity-40">
              Previous
            </span>
          )}
          <span className="px-2 text-sm text-[var(--muted)]">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={buildBuyHref(params, page + 1)} className="btn-ghost">
              Next
            </Link>
          ) : (
            <span className="btn-ghost cursor-not-allowed opacity-40">Next</span>
          )}
        </nav>
      ) : null}
    </>
  );
}

function BuyListingsFallback() {
  return (
    <>
      <div className="mt-4 h-5 w-80 max-w-full animate-pulse rounded bg-[var(--surface)]" />
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5"
          >
            <div className="aspect-[16/10] animate-pulse bg-[var(--surface)]" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-2/3 animate-pulse rounded bg-[var(--surface)]" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--surface)]" />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function BuyPage({ searchParams }: BuyPageProps) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Buy a car</p>
          <h1 className="section-title">Browse available cars</h1>
        </div>
        <Link
          href="/sell"
          className="inline-flex items-center justify-center bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-[var(--accent-strong)]"
        >
          Sell Car
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="mt-8 h-11 animate-pulse rounded bg-[var(--surface)]" />
        }
      >
        <BuySearchBar />
      </Suspense>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded border border-[var(--line)] bg-[var(--surface)]" />
          }
        >
          <BuyFilters />
        </Suspense>

        <div>
          <Suspense fallback={<BuyListingsFallback />}>
            <BuyListings searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link href="/contact" className="btn-ghost">
          Contact us
        </Link>
      </div>
    </div>
  );
}
