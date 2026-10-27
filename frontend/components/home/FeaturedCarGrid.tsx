"use client";

import { motion } from "framer-motion";
import ListingCard from "@/components/cars/ListingCard";
import type { PublicListing } from "@/lib/api/types";

const list = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const card = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function FeaturedCarGrid({ listings }: { listings: PublicListing[] }) {
  return (
    <motion.ul
      className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      variants={list}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {listings.map((listing, i) => (
        <motion.li
          key={listing.slug || listing.path || `${listing.make}-${listing.model}-${i}`}
          variants={card}
        >
          <ListingCard listing={listing} />
        </motion.li>
      ))}
    </motion.ul>
  );
}
