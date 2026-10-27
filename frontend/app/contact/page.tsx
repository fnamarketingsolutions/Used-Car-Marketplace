import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactFormSection from "@/components/contact/ContactFormSection";
import ContactMap from "@/components/contact/ContactMap";

export const metadata: Metadata = {
  title: "Contact | Used Car Marketplace",
  description:
    "Get in touch with Used Car Marketplace—send a message or reach us by phone, email, or at our office.",
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactFormSection />
      <ContactMap />
    </>
  );
}
