import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="container-page py-16">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
        Privacy Policy
      </h1>
      <div className="prose prose-slate mt-6 max-w-3xl text-teal-500 space-y-4">
        <p>{SITE.name} is a local business directory operating from Edmonton, Alberta.</p>
        <h2 className="font-display text-xl font-bold text-teal">What we collect</h2>
        <p>The site does not require accounts. We collect anonymous analytics (page views, referrer, device) via privacy-friendly analytics.</p>
        <p>When you submit a listing, review, or photo via our Google Forms, we collect the info you provide (name, email, business details, photos). Reviews are moderated before appearing on the site. Emails are used for verification only and are never displayed publicly.</p>
        <h2 className="font-display text-xl font-bold text-teal">What we don't do</h2>
        <p>We don't sell your data. We don't run behavioural ad tracking beyond what your browser sends by default. We don't attach cookies to identify you across sites.</p>
        <h2 className="font-display text-xl font-bold text-teal">Contact</h2>
        <p>Questions about privacy? Email <a href={`mailto:${SITE.deliveryEmail}`} className="text-coral hover:underline">{SITE.email}</a>.</p>
      </div>
    </section>
  );
}
