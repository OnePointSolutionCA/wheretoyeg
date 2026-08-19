import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <section className="container-page py-16">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-teal sm:text-5xl">
        Terms of Service
      </h1>
      <div className="mt-6 max-w-3xl space-y-4 text-teal-500">
        <p>Use of {SITE.name} is subject to these terms. By browsing or submitting information, you agree to them.</p>
        <h2 className="font-display text-xl font-bold text-teal">Listings</h2>
        <p>Businesses that appear on {SITE.name} pay a monthly or annual fee for the tier they choose (Basic, Featured, Premium). Payment is handled externally via e-transfer or Stripe. Listings may be paused or removed for non-payment or violation of these terms.</p>
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
