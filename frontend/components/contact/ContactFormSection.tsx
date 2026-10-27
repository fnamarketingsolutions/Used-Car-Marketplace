"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";

export default function ContactFormSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="overflow-hidden bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="font-display text-2xl font-bold text-[var(--ink)] sm:text-3xl">
            Send a message
          </h2>
          <p className="mt-3 text-[var(--muted)] leading-relaxed">
            Fill out the form and we’ll get back to you. Delivery to support is
            coming soon—this form stores nothing yet.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {submitted ? (
              <p className="form-success">
                Thanks{name ? `, ${name}` : ""}. Your message was recorded
                locally for this demo.
              </p>
            ) : null}

            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Send message
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="font-display text-2xl font-bold text-[var(--ink)] sm:text-3xl">
            Contact information
          </h2>
          <span
            className="mt-3 block h-0.5 w-10 bg-[var(--accent)]"
            aria-hidden
          />
          <p className="mt-5 text-[var(--muted)] leading-relaxed">
            We provide everything you need to buy and sell used cars with
            clearer listings and a seller dashboard that stays out of the way.
          </p>

          <ul className="mt-8 space-y-5 text-[var(--ink)]">
            <li className="flex gap-3">
              <span className="mt-0.5 text-[var(--accent)]">
                <PinIcon />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide">
                  Address
                </p>
                <p className="mt-1 text-[var(--muted)]">
                  1105 Roosevelt Street, CA
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 text-[var(--accent)]">
                <PhoneIcon />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide">
                  Phone
                </p>
                <a
                  href="tel:0951856558"
                  className="mt-1 block text-[var(--muted)] transition hover:text-[var(--accent)]"
                >
                  095 1856 558
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 text-[var(--accent)]">
                <MailIcon />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide">
                  Email
                </p>
                <a
                  href="mailto:support@usedcarmarketplace.com"
                  className="mt-1 block text-[var(--muted)] transition hover:text-[var(--accent)]"
                >
                  support@usedcarmarketplace.com
                </a>
              </div>
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
