export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <p className="section-kicker">Legal</p>
      <h1 className="section-title">Privacy Policy</h1>
      <div className="section-copy mt-6 max-w-2xl space-y-4">
        <p>
          Used Car Marketplace respects your privacy. This page describes how we
          handle information when you browse listings, create an account, or
          contact sellers on our platform.
        </p>
        <p>
          We collect account details you provide (such as name, email, and phone
          number), listing information you publish, and basic technical data
          needed to keep the service secure and reliable.
        </p>
        <p>
          We use this information to operate the marketplace, connect buyers and
          sellers, improve the product, and comply with legal obligations. We do
          not sell your personal information.
        </p>
        <p>
          This is a summary placeholder. Full policy language will be published
          here before public launch. Questions? Reach us via the{" "}
          <a href="/contact" className="text-[var(--accent)] underline-offset-2 hover:underline">
            Contact
          </a>{" "}
          page.
        </p>
      </div>
    </div>
  );
}
