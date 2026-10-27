"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    id: "1",
    name: "Sara Lisbon",
    role: "Buyer",
    quote:
      "Found a well-maintained Creta without endless broker calls. Photos, specs, and seller chat were all in one place.",
    carImage:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "2",
    name: "Rahul Mehta",
    role: "Seller",
    quote:
      "Listed my Honda City in the morning and had serious buyers by evening. The process felt clear and trustworthy.",
    carImage:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "3",
    name: "Sneha Iyer",
    role: "Seller",
    quote:
      "Selling was straightforward. The dashboard made it easy to pause the listing and track inquiries from real buyers.",
    carImage:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "4",
    name: "Ananya Sharma",
    role: "Buyer",
    quote:
      "Compared several cars side by side and messaged sellers directly. Saved time and closed on a fair price.",
    carImage:
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "5",
    name: "Vikram Patel",
    role: "Buyer",
    quote:
      "Mileage and history details helped me shortlist quickly. Direct contact meant no middleman markups.",
    carImage:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    id: "6",
    name: "Priya Nair",
    role: "Seller",
    quote:
      "Transparent pricing and real photos brought serious inquiries. Sold within a week of listing.",
    carImage:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80",
  },
];

type TestimonialItem = (typeof TESTIMONIALS)[number];

export default function AboutTestimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    function update() {
      setPerView(window.matchMedia("(min-width: 1024px)").matches ? 3 : 1);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, TESTIMONIALS.length - perView);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (paused || maxIndex === 0) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 3000);
    return () => window.clearInterval(id);
  }, [paused, maxIndex]);

  return (
    <section className="overflow-hidden bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="text-sm text-[var(--muted)]">
            What our happy clients say about us
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-wide text-[var(--ink)] uppercase sm:text-4xl">
            Our Testimonial
          </h2>
          <span
            className="mx-auto mt-4 block h-0.5 w-14 bg-[var(--accent)]"
            aria-hidden
          />
        </motion.div>

        <motion.div
          className="relative mt-14 overflow-hidden"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${index * (100 / perView)}%)`,
            }}
          >
            {TESTIMONIALS.map((item) => (
              <div
                key={item.id}
                className="shrink-0 px-0 lg:px-3"
                style={{ width: `${100 / perView}%` }}
              >
                <TestimonialCard item={item} />
              </div>
            ))}
          </div>
        </motion.div>

        <div
          className="mt-10 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Testimonials"
        >
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show testimonials starting at ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-8 bg-[var(--accent)]"
                  : "w-2.5 bg-[var(--line)] hover:bg-[var(--muted)]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-[var(--line)] bg-white transition-colors duration-300 hover:border-[var(--accent)] hover:bg-[var(--surface)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface)]">
        <Image
          src={item.carImage}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      </div>

      <div className="relative flex flex-1 flex-col items-center px-6 pb-8 pt-10 text-center">
        <div className="absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 overflow-hidden rounded-full border-4 border-white bg-[var(--surface)] shadow-sm">
          <Image
            src={item.avatar}
            alt={item.name}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </div>

        <p className="mt-2 font-semibold text-[var(--accent)]">{item.name}</p>
        <p className="text-sm text-[var(--muted)]">{item.role}</p>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--muted)]">
          {item.quote}
        </p>
        <span className="mt-5 text-3xl leading-none text-[var(--line)]" aria-hidden>
          &ldquo;
        </span>
      </div>
    </article>
  );
}
