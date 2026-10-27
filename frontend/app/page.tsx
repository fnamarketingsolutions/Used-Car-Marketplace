import { Suspense } from "react";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import FeaturedCars from "@/components/home/FeaturedCars";
import Services from "@/components/home/Services";
import Reviews from "@/components/home/Reviews";
import Faq from "@/components/home/Faq";
import Cta from "@/components/home/Cta";

function FeaturedCarsFallback() {
  return (
    <section id="cars" className="section-block scroll-mt-28 bg-[var(--bg)]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-10 w-56 animate-pulse rounded bg-[var(--surface)]" />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Suspense fallback={<FeaturedCarsFallback />}>
        <FeaturedCars />
      </Suspense>
      <Services />
      <Reviews />
      <Faq />
      <Cta />
    </>
  );
}
