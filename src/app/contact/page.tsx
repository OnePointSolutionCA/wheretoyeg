import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${SITE.name} team.`,
};

export default function ContactPage() {
  return (
    <section className="container-page py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
            Say hi.
          </h1>
          <p className="mt-4 max-w-md text-teal-500">
            Business listings, corrections, tips, partnerships — send it all to the same inbox. We reply within 1 business day.
          </p>

          <div className="mt-8 space-y-4 text-teal">
            <div>
              <span className="eyebrow text-teal-500">Email us directly</span>
              <div className="mt-1">
                <a href={`mailto:${SITE.deliveryEmail}?subject=${encodeURIComponent("Hey WhereToYEG")}`} className="font-display text-xl font-bold text-teal hover:text-coral">
                  {SITE.email}
                </a>
              </div>
            </div>
            <div>
              <span className="eyebrow text-teal-500">Social</span>
              <div className="mt-1 flex gap-2">
                <a href={SITE.social.instagram} className="chip" target="_blank" rel="noreferrer">Instagram</a>
                <a href={SITE.social.tiktok} className="chip" target="_blank" rel="noreferrer">TikTok</a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <h2 className="font-display text-2xl font-bold text-teal">Send a message</h2>
          <p className="mt-1 text-sm text-teal-500">We&apos;ll email you back at the address you enter below.</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
