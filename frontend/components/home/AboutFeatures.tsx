const FEATURES = [
  {
    title: "Verified Sellers",
    copy: "Listings come from registered sellers with clear contact and account safeguards.",
    icon: TruckIcon,
  },
  {
    title: "Clear Specs",
    copy: "Year, fuel, transmission, and kilometres are shown up front on every card.",
    icon: WrenchIcon,
  },
  {
    title: "24/7 Help Center",
    copy: "Reach us anytime for listing help, account questions, or buying guidance.",
    icon: HeadsetIcon,
  },
  {
    title: "Secure Deals",
    copy: "Transparent pricing in rupees and full listing details before you decide.",
    icon: GiftIcon,
  },
];

export default function AboutFeatures() {
  return (
    <section className="relative overflow-hidden bg-[#121212] py-16 text-white sm:py-20">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-28 bg-[url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=400&q=60')] bg-cover bg-center opacity-30 lg:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-28 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=60')] bg-cover bg-center opacity-30 lg:block"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex flex-col items-center text-center">
            <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-[var(--accent)]">
              <feature.icon />
            </span>
            <h3 className="text-lg font-bold">{feature.title}</h3>
            <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-white/75">
              {feature.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TruckIcon() {
  return (
    <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 8h11v9H3V8Z" />
      <path d="M14 11h4l3 3v3h-7v-6Z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M14.5 6.5a3.5 3.5 0 0 0-4.7 4.7L4 17v3h3l5.8-5.8a3.5 3.5 0 0 0 4.7-4.7l-2.2 2.2-2.8-2.8 2-2Z" strokeLinejoin="round" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v3a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2ZM20 13v3a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z" />
      <path d="M12 19v1a2 2 0 0 0 2 2h2" strokeLinecap="round" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="10" width="16" height="10" rx="1" />
      <path d="M12 10v10M4 14h16" />
      <path d="M12 10c-2-3-5-3-5-1.5S9 10 12 10ZM12 10c2-3 5-3 5-1.5S15 10 12 10Z" />
    </svg>
  );
}
