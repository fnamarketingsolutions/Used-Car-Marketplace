"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PublicListingDetail from "@/components/cars/PublicListingDetail";
import PageLoader from "@/components/ui/PageLoader";
import { getPublicVehicle } from "@/lib/api/usedCars";
import { ApiError, type PublicListing } from "@/lib/api/types";

export default function BuyVehiclePage() {
  const params = useParams<{
    make: string;
    model: string;
    year: string;
    slug: string;
  }>();
  const [listing, setListing] = useState<PublicListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const make = params.make;
    const model = params.model;
    const year = params.year;
    const slug = params.slug;
    if (!make || !model || !year || !slug) return;

    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPublicVehicle({ make, model, year, slug });
        if (active) setListing(res.listing);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load listing"
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [params.make, params.model, params.year, params.slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6">
        <PageLoader label="Loading listing…" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="form-error max-w-xl">{error || "Listing not found"}</p>
        <Link href="/buy" className="btn-ghost mt-6 inline-flex">
          Back to browse
        </Link>
      </div>
    );
  }

  return <PublicListingDetail listing={listing} />;
}
