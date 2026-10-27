import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import AboutIntro from "@/components/about/AboutIntro";
import AboutHistory from "@/components/about/AboutHistory";
import AboutTestimonials from "@/components/about/AboutTestimonials";

export const metadata: Metadata = {
  title: "About | Used Car Marketplace",
  description:
    "Learn about Used Car Marketplace—how we connect buyers and sellers of quality used cars with clear listings and direct contact.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutIntro />
      <AboutHistory />
      <AboutTestimonials />
    </>
  );
}
