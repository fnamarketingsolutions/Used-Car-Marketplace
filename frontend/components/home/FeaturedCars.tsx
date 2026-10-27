import Link from "next/link";
import FeaturedCarGrid from "@/components/home/FeaturedCarGrid";
import { getPublicListings } from "@/lib/api/listings";

export default async function FeaturedCars() {
  let listings: Awaited<ReturnType<typeof getPublicListings>>["listings"] = [];

  try {
    const data = await getPublicListings({ page: 1, limit: 6 });
    listings = data.listings;
  } catch {
    listings = [];
  }

  return (
    <section id="cars" className="py-20 md:py-28 bg-[#F5F5F5] scroll-mt-28">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* Header Area */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200/80 pb-6">
          <div className="space-y-2">
            <p className="text-sm font-light uppercase tracking-widest text-[#E53E3E]">
              Featured Inventory
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-gray-900">
              Latest <span className="font-normal text-[#E53E3E]">Collection</span>
            </h2>
          </div>

          <Link
            href="/buy"
            className="inline-flex items-center justify-center rounded-xl bg-[#E53E3E] px-6 py-3 text-sm font-light uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#c53030] hover:shadow-md active:scale-95"
          >
            All Cars
          </Link>
        </div>

        {/* Content / Grid */}
        {listings.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-8 text-center border border-gray-200/80 shadow-sm">
            <p className="text-base font-light text-gray-600">
              No live listings available right now. Check back soon or{" "}
              <Link 
                href="/sell" 
                className="font-normal text-[#E53E3E] underline underline-offset-4 hover:text-[#c53030] transition-colors"
              >
                sell your car
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <FeaturedCarGrid listings={listings} />
          </div>
        )}

      </div>
    </section>
  );
}