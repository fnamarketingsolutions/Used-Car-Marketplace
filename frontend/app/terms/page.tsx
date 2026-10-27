export default function TermsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <p className="section-kicker">Legal</p>
      <h1 className="section-title">Terms and Conditions</h1>
      <div className="section-copy mt-6 max-w-2xl space-y-4">
        <p>
          By using Used Car Marketplace you agree to these terms. The platform
          helps buyers and sellers discover and list used vehicles; we are not a
          party to private transactions between users.
        </p>
        <p>
          You are responsible for the accuracy of your listings, communications,
          and any agreements you make with other users. Listings must be lawful,
          truthful, and free of misleading or fraudulent content.
        </p>
        <p>
          We may suspend or remove accounts or listings that violate these terms
          or harm other users. Features and availability may change as the
          product develops.
        </p>
        <p>
          This is a summary placeholder. Complete terms will be published here
          before public launch. Questions? Reach us via the{" "}
          <a href="/contact" className="text-[var(--accent)] underline-offset-2 hover:underline">
            Contact
          </a>{" "}
          page.
        </p>
      </div>
    </div>
  );
}
