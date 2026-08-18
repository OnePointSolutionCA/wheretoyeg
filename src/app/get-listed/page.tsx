import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get your Edmonton business listed",
  description:
    "Get your business in front of Edmonton locals searching for what you offer. Plans start at $25/month — no contracts, no dashboards.",
};

const TIERS = [
  {
    name: "Basic",
    price: "$25",
    yearly: "$200/yr",
    features: [
      "Business name, contact info, and description (up to 100 words)",
      "1 photo",
      "Link to your website and socials",
      "Listed on your category page",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Featured",
    price: "$50",
    yearly: "$500/yr",
    features: [
      "Everything in Basic",
      "Up to 5 photos",
      "250-word description",
      "Top placement on your category page",
      '"Featured" badge on your card',
    ],
    cta: "Go featured",
    highlight: true,
  },
  {
    name: "Premium",
    price: "$100",
    yearly: "$900/yr",
    features: [
      "Everything in Featured",
      "Full dedicated business page",
      "Unlimited photos, 500-word description",
      "Embedded map + full contact info",
      "Homepage rotation",
    ],
    cta: "Go premium",
    highlight: false,
  },
];

export default function GetListedPage() {
  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="container-page py-16 text-center">
          <p className="eyebrow">For Edmonton business owners</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
            Get your business on WhereToYEG.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-teal-500">
            Every listing is a permanent SEO asset. When Edmontonians google what you do, you show up.
          </p>
        </div>
      </section>

      <section className="container-page mt-12" data-reveal="up">
        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={
                "relative flex flex-col rounded-3xl border p-8 " +
                (t.highlight
                  ? "border-coral bg-white shadow-lift"
                  : "border-line bg-white")
              }
            >
              {t.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-coral px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  Most popular
                </span>
              )}
              <div>
                <div className="font-display text-lg font-bold text-teal">{t.name}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-extrabold text-teal">{t.price}</span>
                  <span className="text-sm text-teal-500">/mo</span>
                </div>
                <div className="mt-1 text-xs text-teal-300">or {t.yearly}</div>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2 text-teal-500">
                    <span className="text-coral">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#apply"
                className={"mt-8 " + (t.highlight ? "btn-primary" : "btn-ghost")}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="apply" className="container-page mt-16" data-reveal="left">
        <div className="rounded-3xl border border-line bg-mist p-8 sm:p-12">
          <p className="eyebrow">Apply</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-teal">
            Tell us about your business.
          </h2>
          <p className="mt-2 max-w-xl text-teal-500">
            Send us your details. We'll confirm, take payment (e-transfer or Stripe link), and get your listing live within a few days.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://docs.google.com/forms/d/e/FORM_ID/viewform"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              Open the form →
            </a>
            <Link href="/contact" className="btn-ghost">
              Prefer to email? Contact us
            </Link>
          </div>
          <p className="mt-4 text-xs text-teal-300">
            Replace <code>FORM_ID</code> with your Google Form ID before launch.
          </p>
        </div>
      </section>
    </>
  );
}
