"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const SERVICES = [
  {
    title: "Verified Listings",
    copy: "Structured vehicle details, verified mechanical inspection points, transparent pricing, and clear seller visibility controls keep your browsing experience straightforward and reliable.",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80",
    alt: "Dark metallic luxury sedan",
  },
  {
    title: "City-First Discovery",
    copy: "Locate certified pre-owned cars near you with intelligent location-aware browsing designed specifically for local test drives and quick physical pickups.",
    image:
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1600&q=80",
    alt: "Premium car front angle",
  },
  {
    title: "Seller Dashboard",
    copy: "Track listing views in real-time, pause listings whenever you need, manage buyer inquiries, and execute direct messaging without messy spreadsheets.",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=80",
    alt: "Modern hatchback on display",
  },
];

export default function Services() {
  const [start, setStart] = useState(85);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setStart(media.matches ? 50 : 85);
    update();
    setLive(true);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <section id="services" className="scroll-mt-24 bg-[#F5F5F5] py-20 md:py-28">
      {/* Top Header & Side Image Layout */}
      <div className="mx-auto max-w-6xl px-6 mb-16 lg:mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Side: Header Text & Description (7/12 Cols) */}
          <motion.div 
            className="lg:col-span-7 space-y-4"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-sm font-light uppercase tracking-widest text-[#E53E3E]">
              Services & Features
            </p>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-gray-900">
              What You <span className="font-normal text-[#E53E3E]">Get</span>
            </h2>

            <p className="text-base md:text-lg font-light text-gray-600 leading-relaxed pt-2">
              Used Car Marketplace provides practical tools for transparent buying and selling—moving past cluttered classified boards. Every listing presents key parameters up front: manufacturing year, fuel type, transmission, distance driven, and verified pricing alongside high-resolution imagery.
            </p>
          </motion.div>

          {/* Right Side: Featured Image with Reddish Gapped Border (5/12 Cols) */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            {/* Outer Reddish Offset/Gapped Border */}
            <div className="absolute inset-0 translate-x-3.5 translate-y-3.5 rounded-3xl border-2 border-[#E53E3E]/80 pointer-events-none" />

            {/* Main Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gray-200 shadow-md border border-gray-200/80">
              <Image
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury sport sedan wheel and side profile"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 35vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Subtle Badge Overlay */}
              <div className="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-white/80 p-3.5 rounded-2xl border border-white/50">
                <p className="text-xs font-light text-gray-800 tracking-wide text-center">
                  <strong className="font-semibold text-[#E53E3E]">Verified Standards</strong> — Direct Buyer & Seller Deals
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Expanding Interactive Cards */}
      <div className="space-y-8">
        {SERVICES.map((item) => (
          <ServiceTile key={item.title} item={item} start={start} live={live} />
        ))}
      </div>
    </section>
  );
}

function ServiceTile({
  item,
  start,
  live,
}: {
  item: (typeof SERVICES)[number];
  start: number;
  live: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const width = useTransform(scrollYProgress, (progress) => {
    const grown = Math.min(progress / 0.7, 1);
    return `${start + (100 - start) * grown}%`;
  });

  return (
    <div ref={ref} className="relative h-[180vh]">
      <div className="sticky top-[7.5rem] flex h-[calc(100vh-7.5rem)] items-center">
        <div className="mx-auto w-full max-w-6xl px-6">
          <motion.div
            style={live ? { width } : undefined}
            className="relative isolate h-80 w-[85%] overflow-hidden rounded-3xl shadow-lg sm:h-[30rem] md:w-1/2"
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 85vw, 72rem"
            />
            {/* Soft Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden />

            {/* Expanded Container Text Content */}
            <div className="relative z-10 flex h-full flex-col justify-end px-8 py-10 md:px-12 md:py-12">
              <h3 className="text-2xl md:text-4xl font-light text-white tracking-tight">
                {item.title}
              </h3>
              <p className="mt-4 max-w-2xl text-sm md:text-base font-light text-gray-200 leading-relaxed">
                {item.copy}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}