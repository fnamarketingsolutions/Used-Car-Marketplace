"use client";

import { motion } from "framer-motion";

const MAP_EMBED_SRC =
  "https://maps.google.com/maps?q=1105%20Roosevelt%20Street%2C%20CA&t=&z=14&ie=UTF8&iwloc=&output=embed";

export default function ContactMap() {
  return (
    <section className="overflow-hidden bg-white pb-16 sm:pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="font-display text-2xl font-bold tracking-wide text-[var(--ink)] uppercase sm:text-3xl">
            Find Us
          </h2>
          <span
            className="mx-auto mt-4 block h-0.5 w-14 bg-[var(--accent)]"
            aria-hidden
          />
          <p className="mt-4 text-[var(--muted)]">
            1105 Roosevelt Street, CA
          </p>
        </motion.div>

        <motion.div
          className="mt-10 overflow-hidden border border-[var(--line)] bg-[var(--surface)]"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <iframe
            title="Map showing 1105 Roosevelt Street, CA"
            src={MAP_EMBED_SRC}
            className="h-[280px] w-full border-0 sm:h-[360px] lg:aspect-[21/9] lg:h-auto"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </motion.div>
      </div>
    </section>
  );
}
