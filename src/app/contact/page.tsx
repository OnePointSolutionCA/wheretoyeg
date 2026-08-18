import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${SITE.name} team.`,
};

export default function ContactPage() {
  return (
    <section className="container-page py-16">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
        Say hi.
      </h1>
      <p className="mt-4 max-w-xl text-teal-500">
        Business listings, corrections, tips, partnerships — send it all to the same inbox.
      </p>
      <div className="mt-8 space-y-3 text-teal">
        <div>
          <span className="eyebrow text-teal-500">Email</span>
          <div className="mt-1">
            <a href={`mailto:${SITE.email}`} className="font-display text-2xl font-bold text-teal hover:text-coral">
              {SITE.email}
            </a>
          </div>
        </div>
        <div>
          <span className="eyebrow text-teal-500">Social</span>
          <div className="mt-1 flex gap-3">
            <a href={SITE.social.instagram} className="chip" target="_blank" rel="noreferrer">Instagram</a>
            <a href={SITE.social.tiktok} className="chip" target="_blank" rel="noreferrer">TikTok</a>
          </div>
        </div>
      </div>
    </section>
  );
}
