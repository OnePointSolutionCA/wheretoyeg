import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | WhereToYEG" },
  description: "WhereToYEG terms of service: the rules for listings, reviews, photos and content accuracy on Edmonton's local business directory. Please read before using it.",
  alternates: { canonical: `${SITE.url}/terms` },
};

export default function TermsPage() {
  return (
    <section className="container-page py-16">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
        Terms of Service
      </h1>
      <div className="mt-6 max-w-3xl space-y-4 text-teal-500">
        <p>Use of {SITE.name} is subject to these terms. By browsing or submitting information, you agree to them.</p>
        <h2 className="font-display text-xl font-bold text-teal">Listings</h2>
        <p>Listing a business on {SITE.name} is free. We may edit, pause, or remove listings that are inaccurate, permanently closed, duplicated, or in violation of these terms.</p>
        <h2 className="font-display text-xl font-bold text-teal">Reviews and photos</h2>
        <p>Reviews and photos submitted through our forms are moderated before publishing. We reserve the right to reject spam, fake, defamatory, or otherwise inappropriate submissions.</p>
        <h2 className="font-display text-xl font-bold text-teal">Content accuracy</h2>
        <p>Business information (hours, prices, addresses) is provided by the business or best-effort by our team and may change. Confirm details directly with the business before visiting.</p>
        <h2 className="font-display text-xl font-bold text-teal">Contact</h2>
        <p>Questions? Email <a href={`mailto:${SITE.deliveryEmail}`} className="text-coral hover:underline">{SITE.email}</a>.</p>
      </div>
    </section>
  );
}
