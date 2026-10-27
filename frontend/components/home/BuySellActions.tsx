import Link from "next/link";

export default function BuySellActions() {
  return (
    <section id="buy-sell" className="scroll-mt-24 border-y border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:grid-cols-2 sm:gap-12">
        <div>
          <h2 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
            Looking to buy?
          </h2>
          <p className="mt-3 max-w-md text-[var(--muted)]">
            Browse cars by city, compare condition and price, then reach sellers directly.
          </p>
          <Link href="/buy" className="btn-primary mt-6 inline-flex">
            Browse cars
          </Link>
        </div>
        <div>
          <h2 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
            Ready to sell?
          </h2>
          <p className="mt-3 max-w-md text-[var(--muted)]">
            Open your dashboard, list your car, and manage buyer inquiries in one place.
          </p>
          <Link href="/sell" className="btn-accent mt-6 inline-flex">
            Go to sell dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
