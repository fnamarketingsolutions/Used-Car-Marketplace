import Image from "next/image";
import Link from "next/link";

export default function Cta() {
  return (
    <section id="cta" className="scroll-mt-24 mb-16 md:mb-24 lg:mb-32">
      <div className="mx-auto max-w-5xl md:max-w-6xl px-4 sm:px-6">
        {/* Main CTA Card Container */}
        <div className="relative isolate overflow-hidden rounded-3xl text-white shadow-xl min-h-[420px] sm:min-h-[480px] flex items-center">
          
          {/* Background Image */}
          <div className="absolute inset-0 -z-10">
            <Image
              src="/assets/bg-image.png"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 72rem"
            />
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 -z-10 bg-black/65" aria-hidden />

          {/* Card Content Layout */}
          <div className="relative z-10 w-full flex flex-col items-start justify-between gap-8 px-8 py-28 sm:flex-row sm:items-end sm:px-14 md:py-36">
            <div className="max-w-lg">
              <h2 className="font-display text-3xl font-light tracking-tight text-white sm:text-5xl">
                Start your next car move
              </h2>
              <p className="mt-4 text-base font-light text-white/80 leading-relaxed">
                Create a free account to sell from your dashboard, or browse cars available near you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3.5 shrink-0">
              <Link href="/signup" className="btn-primary">
                Create account
              </Link>
              <Link href="/buy" className="btn-secondary">
                Browse cars
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}