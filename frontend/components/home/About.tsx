"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const ABOUT_IMAGE = {
  src: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
  alt: "Dark metallic luxury sedan",
};

export default function About() {
  return (
    <section id="about" className="py-20 md:py-28 bg-[#F5F5F5] scroll-mt-28">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-14">
        
        {/* Left Side: Image with Faded Overlay Card */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-200 shadow-sm">
          <motion.div
            className="absolute inset-0 origin-center"
            initial={{ scale: 1.15 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Image
              src={ABOUT_IMAGE.src}
              alt={ABOUT_IMAGE.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>

          {/* Faded Accent Badge on Image */}
          <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xs backdrop-blur-md bg-white/80 p-4 rounded-xl border border-white/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="flex h-3 w-3 rounded-full bg-[#E53E3E] animate-pulse" />
              <p className="text-xs font-light tracking-wide text-gray-700">
                <strong className="font-semibold text-[#E53E3E]">200+ Point</strong> Vehicle Inspection Verified
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Refined Typography & Features */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Section Kicker */}
          <p className="text-sm font-light uppercase tracking-widest text-[#E53E3E]">
            About Our Platform
          </p>

          {/* Thin, Elegant Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 leading-tight tracking-tight">
            World’s largest <br />
            <span className="font-normal text-[#E53E3E]">automotive</span> marketplace.
          </h2>

          {/* Crisp, Thin Body Copy */}
          <p className="text-base md:text-lg font-light text-gray-600 leading-relaxed max-w-lg">
            Connecting private sellers and buyers through transparent listings, verified inspection data, and direct communication—making honest deals fast and seamless.
          </p>

          {/* Faded Stats Card on Right Side */}
          <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-200/80 my-6">
            <div>
              <p className="text-2xl font-light text-[#E53E3E]">100%</p>
              <p className="text-xs font-light text-gray-500 uppercase tracking-wider">Verified Listings</p>
            </div>
            <div>
              <p className="text-2xl font-light text-[#E53E3E]">Direct</p>
              <p className="text-xs font-light text-gray-500 uppercase tracking-wider">Buyer-Seller Chat</p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-xl bg-[#E53E3E] px-7 py-3 text-sm font-light tracking-wider text-white shadow-sm transition-all hover:bg-[#c53030] hover:shadow-md active:scale-95"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}