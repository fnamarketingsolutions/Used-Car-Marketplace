"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=80";

// Subtle dark grey base64 blur placeholder
const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDUiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjUiIGZpbGw9IiMxYTFhMWEiLz48L3N2Zz4=";

export default function AboutHero() {
  return (
    <section className="relative isolate flex min-h-[48vh] sm:min-h-[58vh] md:min-h-[64vh] items-center justify-start overflow-hidden text-white">
      {/* Background Image with Blur Placeholder */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Image
          src={HERO_IMAGE}
          alt="Classic sports car on an open road"
          fill
          priority
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>
      <div 
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/30" 
        aria-hidden 
      />

      {/* Content Container - Left Aligned */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <motion.div
          className="max-w-2xl text-left space-y-4"
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          
          {/* Kicker */}
          <p className="text-xs sm:text-sm font-light uppercase tracking-widest text-[#E53E3E]">
            Who We Are
          </p>

          {/* Heading with Thin Typography */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white leading-tight">
            About <span className="font-normal text-[#E53E3E]">Us</span>
          </h1>

          {/* Body Copy */}
          <p className="text-base sm:text-lg md:text-xl font-light text-white/85 leading-relaxed pt-1 max-w-xl">
            Connecting buyers and sellers of quality used cars with clear listings, verified specs, real photos, and direct contact.
          </p>

          {/* Reddish Accent Line */}
          <div className="pt-2">
            <span
              className="block h-0.5 w-16 bg-[#E53E3E]"
              aria-hidden
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}