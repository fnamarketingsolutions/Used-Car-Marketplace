"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    question: "How do I buy a car here?",
    answer:
      "Browse live listings, filter by city and specs, then contact the seller directly. Photos, mileage, and asking price are shown up front so you can compare before you reach out.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    question: "How do I list my car?",
    answer:
      "Create a free account, open the seller dashboard, and add photos, year, fuel, transmission, kilometres, and your asking price. You can pause or update the listing anytime.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    question: "Are prices shown clearly?",
    answer:
      "Yes. Asking prices are listed in rupees on every card and detail page, so you can compare deals without hidden broker fees.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    question: "How do I contact a seller?",
    answer:
      "Open a listing and send a message through the contact form. The seller gets the inquiry on their account and can reply from the dashboard.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    question: "Do I need an account to browse?",
    answer:
      "You can browse cars without signing in. An account is needed to save listings, contact sellers, and manage cars you want to sell.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    question: "Where do I get help?",
    answer:
      "Use the contact page for listing help, account questions, or buying guidance. Support is available during posted hours, and we reply as soon as we can.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="scroll-mt-24 bg-[#F5F5F5] py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* Section Header */}
        <motion.div 
          className="space-y-3 max-w-3xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-sm font-light uppercase tracking-widest text-[#E53E3E]">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-gray-900">
            Questions Buyers & Sellers <span className="font-normal text-[#E53E3E]">Ask</span>
          </h2>
          <p className="text-base md:text-lg font-light text-gray-600 leading-relaxed">
            Straight answers on browsing, listing, pricing, and getting in touch.
          </p>
        </motion.div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Side: Comes from Left Side */}
          <motion.div 
            className="lg:col-span-7 flex flex-col gap-4"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {FAQS.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={item.question}
                  className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50/60"
                    aria-expanded={isOpen}
                    onClick={() => toggleFaq(index)}
                  >
                    {/* Icon + Question Text */}
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isOpen
                            ? "bg-[#E53E3E] text-white"
                            : "bg-[#F5F5F5] text-[#E53E3E]"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span
                        className={`text-base md:text-lg tracking-tight transition-colors ${
                          isOpen
                            ? "font-normal text-[#E53E3E]"
                            : "font-light text-gray-900"
                        }`}
                      >
                        {item.question}
                      </span>
                    </div>

                    {/* Expand/Collapse Toggle Indicator */}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base transition-all duration-300 ${
                        isOpen
                          ? "bg-[#E53E3E]/10 text-[#E53E3E] rotate-180"
                          : "bg-gray-100 text-gray-500"
                      }`}
                      aria-hidden
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {/* Smooth Accordion Motion Animation */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transition: {
                            height: { duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.25, delay: 0.1 },
                          },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: {
                            height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.15 },
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 px-6 py-5 pl-16">
                          <p className="text-sm md:text-base font-light text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>

          {/* Right Side: Comes from Right Side */}
          <motion.div 
            className="lg:col-span-5 sticky top-28 hidden lg:block"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-gray-200 shadow-md border border-gray-200/80">
              <Image
                src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury automobile interior steering and dashboard"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 35vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* Floating Glassmorphism Card */}
              <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-white/85 p-5 rounded-2xl border border-white/40 shadow-lg space-y-2">
                <p className="text-xs font-light uppercase tracking-widest text-[#E53E3E]">
                  Need Direct Assistance?
                </p>
                <p className="text-sm font-light text-gray-800 leading-relaxed">
                  Our team provides assistance with vehicle inspection reports, ownership transfers, and seller communication.
                </p>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
} 