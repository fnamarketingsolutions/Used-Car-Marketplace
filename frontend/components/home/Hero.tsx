"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative isolate min-h-[calc(100vh-7.5rem)] overflow-hidden bg-slate-950">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/bg-image.png"
          alt="Sports car on an open road at dusk"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Optional Dark Overlay so white text is readable over the image */}
      <div className="absolute inset-0 bg-black/1" />

      {/* Content Container - Shifted completely to the left */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-7.5rem)] w-full max-w-7xl flex-col justify-center px-6 py-16 sm:px-12 sm:py-24">
        <div className="max-w-xl text-left">
          
          {/* Animated Heading */}
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl font-semibold tracking-tight text-gray-800 sm:text-5xl md:text-6xl"
          >
            Find your next car with confidence
          </motion.h1>

          {/* Animated Description Paragraph */}
          <motion.p
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="mt-4 max-w-md font-sans text-base leading-relaxed text-slate-700 sm:text-lg"
          >
            Browse verified used cars with clear photos, mileage, and pricing—or list yours and reach buyers across the country.
          </motion.p>

          {/* Animated Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {/* Primary Filled Button */}
            <Link
              href="/buy"
              className="flex min-w-[8.5rem] items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-3 text-center text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
            >
              Buy Car
            </Link>

            {/* Secondary Themed Border Button */}
            <Link
              href="/sell"
              className="flex min-w-[8.5rem] items-center justify-center rounded-lg border-2 border-[var(--accent)] bg-transparent px-5 py-3 text-center text-sm font-semibold text-[var(--accent)] transition-all hover:bg-[var(--accent)] hover:text-white active:scale-95"
            >
              Sell Car
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}