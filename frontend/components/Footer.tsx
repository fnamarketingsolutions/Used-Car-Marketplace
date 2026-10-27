import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

const USEFUL_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/buy", label: "Buy Car" },
  { href: "/sell", label: "Sell Car" },
  { href: "/contact", label: "Contact" },
];

const POLICY_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms and Conditions" },
];

const RECENT_POSTS = [
  {
    title: "Time to change your oil filter",
    date: "September 10, 2021",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=160&h=100&q=80",
  },
  {
    title: "The best time to sell your car",
    date: "August 22, 2021",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=160&h=100&q=80",
  },
  {
    title: "How to inspect a used vehicle",
    date: "July 15, 2021",
    image:
      "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=160&h=100&q=80",
  },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-8 sm:pt-20">
        {/* Top: brand */}
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center text-[var(--accent)]">
            <LogoMark />
          </span>
          <span>
            <span className="block font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Used Car Marketplace
            </span>
            <span className="mt-0.5 block text-[0.65rem] uppercase tracking-[0.12em] text-white/60">
              Buy and sell with confidence
            </span>
          </span>
        </Link>

        <div className="mt-8 border-t border-white/20" />

        {/* Contact left; Useful Links + Policies + Recent Posts grouped right */}
        <div className="mt-10 flex flex-col gap-10 md:flex-row md:justify-between md:gap-12">
          {/* Contact + socials */}
          <div className="max-w-sm shrink-0">
            <FooterHeading>Contact Information</FooterHeading>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              We provide everything you need to buy and sell used cars with clearer
              listings and a seller dashboard that stays out of the way.
            </p>
            <ul className="mt-6 space-y-4 text-sm text-white/80">
              <li className="flex gap-3">
                <span className="mt-0.5 text-[var(--accent)]">
                  <PinIcon />
                </span>
                <span>1105 Roosevelt Street, CA</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-[var(--accent)]">
                  <PhoneIcon />
                </span>
                <a href="tel:0951856558" className="transition hover:text-white">
                  095 1856 558
                </a>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-[var(--accent)]">
                  <MailIcon />
                </span>
                <a
                  href="mailto:support@usedcarmarketplace.com"
                  className="transition hover:text-white"
                >
                  support@usedcarmarketplace.com
                </a>
              </li>
            </ul>

            <ul className="mt-6 flex items-center gap-3" aria-label="Social media">
              <li>
                <SocialLink href="#" label="Facebook">
                  <FacebookIcon />
                </SocialLink>
              </li>
              <li>
                <SocialLink href="#" label="X">
                  <XIcon />
                </SocialLink>
              </li>
              <li>
                <SocialLink href="#" label="Instagram">
                  <InstagramIcon />
                </SocialLink>
              </li>
              <li>
                <SocialLink href="#" label="YouTube">
                  <YouTubeIcon />
                </SocialLink>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-12 lg:gap-16">
            {/* Useful Links */}
            <div className="min-w-[10rem]">
              <FooterHeading>Useful Links</FooterHeading>
              <nav aria-label="Footer" className="mt-4">
                <ul className="space-y-2.5">
                  {USEFUL_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/75 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Policies */}
            <div className="min-w-[10rem]">
              <FooterHeading>Policies</FooterHeading>
              <nav aria-label="Policies" className="mt-4">
                <ul className="space-y-2.5">
                  {POLICY_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/75 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Recent Posts */}
            <div className="min-w-0 max-w-xs">
              <FooterHeading>Recent Posts</FooterHeading>
              <ul className="mt-4 space-y-4">
                {RECENT_POSTS.map((post) => (
                  <li key={post.title} className="flex gap-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-white/10">
                      <Image
                        src={post.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug text-white">
                        {post.title}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/60">
                        <span className="text-[var(--accent)]">
                          <CalendarIcon />
                        </span>
                        {post.date}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-white/50">
          © 2026 Used Car Marketplace
        </p>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-base font-semibold tracking-wide text-white">
      {children}
      <span
        className="mt-2 block h-0.5 w-10 bg-[var(--accent)]"
        aria-hidden
      />
    </h2>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center text-white/80 transition hover:text-[var(--accent)]"
    >
      {children}
    </a>
  );
}

function LogoMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-10" fill="currentColor" aria-hidden>
      <circle cx="24" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="16" r="3.5" fill="currentColor" />
      <path
        d="M2 16h8M38 16h8M6 12h6M36 12h6M8 20h4M36 20h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9c0-.6.4-1 1-1Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.4 21H2.3l7.3-8.3L2 3h6.3l4.4 5.8L17.5 3Zm-1.1 16.2h1.7L7.7 4.7H5.9l10.5 14.5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23 12.2s0-3.4-.4-5c-.2-.9-.9-1.6-1.8-1.8C18.6 5 12 5 12 5s-6.6 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 8.8 1 12.2 1 12.2s0 3.4.4 5c.2.9.9 1.6 1.8 1.8C5.4 19.4 12 19.4 12 19.4s6.6 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-5 .4-5ZM9.8 15.5V8.9l5.8 3.3-5.8 3.3Z" />
    </svg>
  );
}
