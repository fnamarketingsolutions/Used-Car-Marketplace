"use client";

import { motion } from "framer-motion";

const MILESTONES = [
  {
    num: "01",
    title: "The Beginning",
    copy: "We launched Used Car Marketplace to cut through broker noise—giving private sellers a clear place to list and buyers a trustworthy way to compare cars.",
  },
  {
    num: "02",
    title: "Growing Cities",
    copy: "Listings expanded across major metros and Tier-2 cities. Sellers gained dashboard tools to manage inquiries, photos, and pricing in one place.",
  },
  {
    num: "03",
    title: "Buyer Confidence",
    copy: "Richer listing details, direct seller contact, and saved searches helped more people shortlist with confidence—and close deals faster.",
  },
];

export default function AboutHistory() {
  return (
    <section className="overflow-hidden bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm text-[var(--muted)]">
            Our journey building a better used-car experience
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-wide text-[var(--ink)] uppercase sm:text-4xl">
            Our History
          </h2>
          <span
            className="mx-auto mt-4 block h-0.5 w-14 bg-[var(--accent)]"
            aria-hidden
          />
        </div>

        <div className="relative mt-16">
          {/* Center line — desktop */}
          <div
            className="absolute top-0 bottom-0 left-4 w-px bg-[var(--line)] md:left-1/2 md:-translate-x-px"
            aria-hidden
          />

          <ul className="space-y-12 md:space-y-16">
            {MILESTONES.map((item, index) => {
              const isLeft = index % 2 === 0;
              return (
                <li
                  key={item.num}
                  className="group relative grid md:grid-cols-2 md:gap-0"
                >
                  {/* Node */}
                  <span
                    className="absolute top-6 left-4 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[var(--line)] bg-white text-xs font-bold text-[var(--ink)] transition-colors duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white md:left-1/2"
                    aria-hidden
                  >
                    {item.num}
                  </span>

                  {/* Spacer for alternating side on desktop */}
                  {isLeft ? null : <div className="hidden md:block" />}

                  <motion.div
                    className={`ml-12 md:ml-0 ${
                      isLeft
                        ? "md:pr-12 md:text-right"
                        : "md:pl-12 md:text-left"
                    }`}
                    initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  >
                    <article
                      className={`relative border border-[var(--line)] bg-white p-6 text-left transition-colors duration-300 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] ${
                        isLeft ? "md:ml-auto md:text-right" : ""
                      }`}
                    >
                      {/* Caret pointing to center */}
                      <span
                        className={`absolute top-7 hidden h-0 w-0 border-y-[8px] border-y-transparent transition-colors duration-300 md:block ${
                          isLeft
                            ? "right-0 translate-x-full border-l-[10px] border-l-[var(--line)] group-hover:border-l-[var(--accent)]"
                            : "left-0 -translate-x-full border-r-[10px] border-r-[var(--line)] group-hover:border-r-[var(--accent)]"
                        }`}
                        aria-hidden
                      />

                      <h3 className="text-sm font-bold tracking-wide text-[var(--ink)] uppercase transition-colors duration-300 group-hover:text-white">
                        {item.title}
                      </h3>
                      <span
                        className={`mt-3 block h-0.5 w-10 bg-[var(--accent)] transition-colors duration-300 group-hover:bg-white ${
                          isLeft ? "md:ml-auto" : ""
                        }`}
                        aria-hidden
                      />
                      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] transition-colors duration-300 group-hover:text-white/90">
                        {item.copy}
                      </p>
                    </article>
                  </motion.div>

                  {isLeft ? <div className="hidden md:block" /> : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
