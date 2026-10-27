"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const INTRO_IMAGE =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80";

const FEATURES = [
  {
    title: "All Brands",
    copy: "Browse hatchbacks, sedans, and SUVs from trusted makes across cities—all in one marketplace.",
    icon: CarIcon,
  },
  {
    title: "Free Support",
    copy: "Questions about a listing or your account? Our team helps buyers and sellers every step of the way.",
    icon: ChatIcon,
  },
  {
    title: "Dealership",
    copy: "Whether you list privately or as a dealer, you get clear tools to manage inventory and inquiries.",
    icon: BuildingIcon,
  },
  {
    title: "Affordable",
    copy: "Transparent asking prices in rupees so you can compare deals without hidden broker fees.",
    icon: WalletIcon,
  },
];

export default function AboutIntro() {
  return (
    <section className="overflow-hidden bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-[var(--muted)]">Welcome to</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-wide text-[var(--ink)] uppercase sm:text-4xl">
            Used Car Marketplace
          </h2>
          <span
            className="mx-auto mt-4 block h-0.5 w-14 bg-[var(--accent)]"
            aria-hidden
          />
          <p className="mt-6 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            An{" "}
            <span className="font-semibold text-[var(--ink)]">
              honest used-car marketplace
            </span>{" "}
            built for India—clear photos, mileage, and pricing so buyers and
            sellers close deals with confidence.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            className="relative aspect-[16/10] overflow-hidden bg-[var(--surface)]"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Image
              src={INTRO_IMAGE}
              alt="Modern car interior with ambient lighting"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>

          <motion.div
            className="space-y-5 text-[var(--muted)] leading-relaxed"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p>
              Used Car Marketplace started with a simple goal: make buying and
              selling a pre-owned car feel as straightforward as shopping for
              anything else online—without the guesswork.
            </p>
            <p>
              Every listing highlights the details that matter: year, make,
              model, kilometers, location, and real photos. Sellers manage
              inquiries from one dashboard; buyers reach owners directly.
            </p>
            <p>
              From first search to handshake, we focus on transparency so you
              spend less time chasing brokers and more time finding the right
              car—or the right buyer.
            </p>
          </motion.div>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <motion.li
              key={feature.title}
              className="group border border-[var(--line)] bg-white px-6 py-8 text-center transition-colors duration-300 hover:border-[var(--accent)] hover:bg-[var(--accent)]"
              initial={{ opacity: 0, x: index < FEATURES.length / 2 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--muted)] transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white">
                <feature.icon />
              </span>
              <h3 className="mt-5 text-sm font-bold tracking-wide text-[var(--ink)] uppercase transition-colors duration-300 group-hover:text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] transition-colors duration-300 group-hover:text-white/90">
                {feature.copy}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CarIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M3 14h18l-1.5-5.5A2 2 0 0 0 17.6 7H6.4a2 2 0 0 0-1.9 1.5L3 14Z" />
      <path d="M5 14v3M19 14v3M7 17h.01M17 17h.01" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4v-4H6a2 2 0 0 1-2-2V6Z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M4 20V8l8-4 8 4v12" />
      <path d="M9 20v-6h6v6M9 10h.01M12 10h.01M15 10h.01M9 13h.01M12 13h.01M15 13h.01" strokeLinecap="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <path d="M16 12h4v2h-4a1 1 0 0 1 0-2Z" />
    </svg>
  );
}
