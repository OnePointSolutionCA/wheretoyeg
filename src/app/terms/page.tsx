import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LegalDoc, OPERATOR, type LegalSection } from "@/components/LegalDoc";

const TITLE = "Terms of Use | WhereToYEG";
const DESCRIPTION =
  "The terms for using WhereToYEG, the WhereToYEG app and WhereToYEG Rewards cards: listings, reviews, rewards rules, offers, fair use and your rights in Alberta.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  ...pageMeta({ path: "/terms", title: TITLE, description: DESCRIPTION }),
};

const sections: LegalSection[] = [
  {
    id: "agree", h: "These terms",
    body: <p>These terms are an agreement between you and {OPERATOR.name} (&quot;we&quot;, &quot;us&quot;), which runs WhereToYEG. They cover the website wheretoyeg.ca, the WhereToYEG app and WhereToYEG Rewards. By using any of them, or by sending us information, you agree to these terms and to our <a href="/privacy">privacy policy</a>.</p>,
  },
  {
    id: "who", h: "Who can use WhereToYEG",
    body: <p>You must be 13 or older to use the app or get a rewards card. If you are under the age of majority where you live, a parent or guardian must agree to these terms for you.</p>,
  },
  {
    id: "licence", h: "Your licence to use the app",
    body: <p>We give you a personal, non exclusive, non transferable licence to use the app on devices you own or control, for your own use. You may not copy, sell, rent, change or take apart the app, or try to get its source code, except where the law allows it.</p>,
  },
  {
    id: "listings", h: "Listings",
    body: <p>Listing a business on WhereToYEG is free. We may edit, pause or remove listings that are inaccurate, permanently closed, duplicated, or that break these terms. A business can ask us to correct or remove its listing by contacting us.</p>,
  },
  {
    id: "reviews", h: "Reviews and photos",
    body: <p>Reviews and photos sent through our forms are checked before they are published. We may refuse spam, fake, defamatory or otherwise inappropriate submissions. By sending a review or photo, you confirm you have the right to share it and you allow us to publish it on WhereToYEG.</p>,
  },
  {
    id: "accuracy", h: "Content accuracy",
    body: <p>Business information such as hours, prices, addresses and ratings comes from businesses, public sources and our own research, and it can change. Please confirm details with the business before you visit.</p>,
  },
  {
    id: "rewards", h: "Rewards cards",
    body: <ul>
      <li>Each business runs its own card and sets its own rules: how many stamps or points, the reward, and how often a card can be stamped.</li>
      <li>Rewards have no cash value, cannot be exchanged for money, and cannot be sold or given to someone else unless the business allows it.</li>
      <li>One card per person per business, unless the business allows more.</li>
      <li>A business can change or end its program. If it does, unused stamps or points may end too.</li>
      <li>Your card is kept on your phone. If you lose or reset your phone, you may lose the card unless you add it to a wallet or keep its link.</li>
      <li>Stamps or rewards gained by fraud or misuse can be removed, and the card can be turned off.</li>
      <li>The business, not us, is responsible for giving you the reward. If there is a problem, contact the business, and we will help where we can.</li>
    </ul>,
  },
  {
    id: "offers", h: "Offers and sponsored content",
    body: <p>Offers are sent by businesses, and sponsored listings are marked as sponsored. The business is responsible for its offer, its products and its services. Showing an offer or a sponsored listing does not mean we recommend or guarantee it. Offers can end or change at any time. To report an offer, contact us.</p>,
  },
  {
    id: "business", h: "Business owners and staff",
    body: <p>Staff mode and the business dashboard are only for people a business has authorized. Keep business codes and PINs private and tell the owner right away if one may be known by someone else. The business is responsible for what its staff do with the scanner. Paid services for businesses are covered by a separate agreement with us.</p>,
  },
  {
    id: "use", h: "Using WhereToYEG fairly",
    body: <>
      <p>You agree not to:</p>
      <ul>
        <li>add stamps or points you did not earn, or use someone else&apos;s card or PIN;</li>
        <li>copy or collect the directory in bulk, or use bots or scrapers;</li>
        <li>send fake listings, reviews or photos;</li>
        <li>try to break into, overload or disrupt the website, the app or our servers;</li>
        <li>use WhereToYEG for anything illegal, harmful or misleading.</li>
      </ul>
    </>,
  },
  {
    id: "third", h: "Other services and links",
    body: <p>WhereToYEG links to other services, such as maps, phone calls, business websites, weather from Environment and Climate Change Canada, and Google Wallet or Apple Wallet. Their own terms and privacy policies apply when you use them, and we are not responsible for them.</p>,
  },
  {
    id: "ours", h: "Our content",
    body: <p>The website, the app, the WhereToYEG name and logo, and our guides belong to us or to the people who licensed them to us. Business names and logos belong to those businesses.</p>,
  },
  {
    id: "end", h: "Suspending or ending access",
    body: <p>You can stop using WhereToYEG and delete your cards at any time. We may suspend or turn off a card, listing or account that breaks these terms or is used for fraud. We may change or stop parts of WhereToYEG, and will give reasonable notice when we can.</p>,
  },
  {
    id: "warranty", h: "Disclaimer",
    body: <p>To the extent the law allows, WhereToYEG is provided &quot;as is&quot;, without promises that it will always be available, error free, or that listings and offers are accurate. Nothing in these terms takes away rights you have under consumer protection laws that cannot be waived.</p>,
  },
  {
    id: "liability", h: "Limit of liability",
    body: <p>To the extent the law allows, we are not responsible for indirect or unexpected losses, or for what businesses do or fail to do, including giving rewards or honouring offers. Our total responsibility to you for any claim is limited to $100. This does not limit liability that the law does not allow us to limit.</p>,
  },
  {
    id: "law", h: "Law and disputes",
    body: <p>These terms are governed by the laws of Alberta and the laws of Canada that apply there. Disputes go to the courts in Edmonton, Alberta, unless the consumer laws of your province give you the right to go to your own courts.</p>,
  },
  {
    id: "changes", h: "Changes to these terms",
    body: <p>We may update these terms. We will change the date at the top, and tell you in the app or on the website before important changes apply. If you keep using WhereToYEG after that, the new terms apply.</p>,
  },
  {
    id: "apple", h: "If you got the app from the Apple App Store",
    body: <ul>
      <li>These terms are between you and us, not Apple. We, not Apple, are responsible for the app and its content.</li>
      <li>Your licence is to use the app on Apple devices you own or control, as allowed by the App Store&apos;s Usage Rules.</li>
      <li>Apple has no duty to provide maintenance or support for the app.</li>
      <li>If the app does not meet any warranty that applies, you may tell Apple and Apple will refund the purchase price, if any. To the extent the law allows, Apple has no other warranty duty for the app.</li>
      <li>We, not Apple, handle any claims about the app, including product liability, failing to meet legal requirements, consumer protection and privacy claims, and claims that the app infringes someone&apos;s intellectual property.</li>
      <li>You confirm you are not in a country under a United States government embargo or on a United States list of prohibited or restricted parties.</li>
      <li>You must follow any third party terms that apply when you use the app, such as your mobile carrier&apos;s.</li>
      <li>Apple and its subsidiaries are third party beneficiaries of these terms and may enforce them against you.</li>
    </ul>,
  },
  {
    id: "contact", h: "Contact us",
    body: <p>{OPERATOR.name}<br />{OPERATOR.address}<br />Email: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a><br />Phone: {OPERATOR.phone}</p>,
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Use"
      effective="November 13, 2026"
      intro={<p>The rules for using the WhereToYEG website, the WhereToYEG app and WhereToYEG Rewards cards, in plain words.</p>}
      sections={sections}
    />
  );
}
