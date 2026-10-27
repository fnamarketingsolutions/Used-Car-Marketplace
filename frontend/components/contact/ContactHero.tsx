"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=1920&q=80";

export default function ContactHero() {
  return (
    <section className="relative isolate flex min-h-[42vh] items-center justify-center overflow-hidden sm:min-h-[52vh]">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Image
          src={HERO_IMAGE}
          alt="Car on a coastal road at dusk"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/55" />

      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center text-white"
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="text-sm font-medium tracking-[0.18em] text-white/80 uppercase">
          Get in touch
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Contact
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
          Questions about buying or selling? Reach our team—we’re here to help
          with listings, accounts, and marketplace support.
        </p>
        <span
          className="mx-auto mt-6 block h-0.5 w-14 bg-[var(--accent)]"
          aria-hidden
        />
      </motion.div>
    </section>
  );
}
