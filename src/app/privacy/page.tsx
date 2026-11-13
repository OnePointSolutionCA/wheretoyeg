import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LegalDoc, OPERATOR, type LegalSection } from "@/components/LegalDoc";

const TITLE = "Privacy Policy | WhereToYEG";
const DESCRIPTION =
  "How WhereToYEG, the WhereToYEG app and WhereToYEG Rewards cards handle your information. Location stays on your phone, no data sales, and delete anytime.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  ...pageMeta({ path: "/privacy", title: TITLE, description: DESCRIPTION }),
};

const sections: LegalSection[] = [
  {
    id: "who", h: "Who we are and what this covers",
    body: <>
      <p>WhereToYEG is run by {OPERATOR.name}, {OPERATOR.address} (&quot;we&quot;, &quot;us&quot;). This policy covers the website wheretoyeg.ca, the WhereToYEG app for iPhone and Android, and WhereToYEG Rewards (the loyalty cards, the staff scanner and the business dashboard).</p>
      <p>Each business that offers a rewards card runs its own program. For card information, that business decides how it is used and we handle it for them as their service provider. For everything else in this policy, we are responsible.</p>
    </>,
  },
  {
    id: "short", h: "The short version",
    body: <ul>
      <li>You can browse the directory without giving us anything about you.</li>
      <li>A rewards card needs only a name. Phone or email is optional.</li>
      <li>In the app, your location stays on your phone. We never receive it and we keep no location history.</li>
      <li>Offers only come from businesses you said yes to, and you can stop them any time.</li>
      <li>We do not sell your information, we do not use ad networks, and we do not track you across other companies&apos; apps.</li>
      <li>You can delete your cards and your details at any time.</li>
    </ul>,
  },
  {
    id: "collect", h: "What we collect and why",
    body: <>
      <p><b>Browsing the website.</b> We use Google Analytics (with shortened IP addresses) and Ahrefs Web Analytics to count visits and see which pages are useful: pages viewed, the site you came from, device and browser type, and general area. Google Analytics uses cookies for this. We do not use this information to identify you or to show you ads.</p>
      <p><b>Browsing in the app.</b> Nothing that identifies you. If you allow location, the app uses it on your phone to show places near you. It is not sent to us.</p>
      <p><b>Forms on the website.</b> When you contact us or ask to get your business listed, we receive what you type (such as your name, email, phone, business details and message) by email, and use it to answer you and handle your request.</p>
      <p><b>Rewards cards.</b> When you get a card: the name you type, and a phone number or email if you choose to give one. We then keep your stamps or points, visits, rewards used, which staff member stamped your card and when, and the random code in your card&apos;s QR. We use this to run your card, to let staff find your card by phone if the code does not scan, and to give the business its numbers.</p>
      <p><b>Offers.</b> Whether you said yes to offers from a business, the exact words you agreed to, and when. This is our record of your consent.</p>
      <p><b>Staff.</b> A staff member&apos;s name, a scrambled version of their PIN (never the PIN itself), and a log of the stamps and rewards they give. To stop PIN guessing we keep a one way code made from the device&apos;s internet address for 30 days. We never keep the address itself.</p>
      <p><b>Business owners.</b> The email used to sign in, and the business details the owner enters (logo, colours, reward, contact details, locations).</p>
      <p><b>Technical.</b> Our hosting providers record basic request logs (internet address, device or browser type, time) to keep the service running and safe. These are kept for a short time.</p>
      <p><b>Sponsored content.</b> Sponsored listings are marked as sponsored. We do not record who sees them. If you tap one, the business&apos;s website opens with a tag in the link that tells them the visit came from WhereToYEG.</p>
    </>,
  },
  {
    id: "dont", h: "What we do not do",
    body: <ul>
      <li>We do not sell, rent or trade personal information.</li>
      <li>We do not use advertising networks or the advertising ID, and we do not track you across other companies&apos; apps.</li>
      <li>We do not read your contacts or photos.</li>
      <li>We do not keep a history of where you go.</li>
    </ul>,
  },
  {
    id: "location", h: "Location and nearby alerts",
    body: <>
      <p>Location is optional and the app works without it.</p>
      <p><b>Places near you.</b> While you use the app, it can use your location to sort places by distance. This happens on your phone.</p>
      <p><b>Nearby alerts.</b> If you turn this on, your phone watches for when you come within about 4 km of a business where you have a card, even when the app is closed. To do that, your phone asks you to allow location &quot;Always&quot;. The check happens on your phone: your location is never sent to us or to the business. You get at most one alert per business a day, and none at night.</p>
      <p>Turn alerts off any time in the app or in your phone&apos;s settings. Turning them off does not affect your cards or rewards.</p>
    </>,
  },
  {
    id: "messages", h: "Notifications and offers",
    body: <>
      <p><b>Card updates</b> (for example &quot;Reward ready&quot;) are about the card you asked for.</p>
      <p><b>Offers</b> are promotions from a business. You only get them if you ticked the box to say yes to that business, and the box is never ticked for you. Each offer names the business. Tap &quot;Stop offers&quot; on the card, or turn offers off in the app, and they stop right away. We always act on a request to stop within 10 business days, as Canada&apos;s anti spam law requires.</p>
      <p>You can also turn off all notifications in your phone&apos;s settings. Your cards and rewards keep working either way.</p>
    </>,
  },
  {
    id: "cookies", h: "Cookies on the website",
    body: <p>The website uses cookies from Google Analytics to count visits, and stores small settings in your browser (for example, that you already saw a welcome screen). You can block or delete cookies in your browser settings, or use Google&apos;s opt out add on for Google Analytics. The site works without them.</p>,
  },
  {
    id: "share", h: "Who can see your information",
    body: <>
      <p><b>The business that gave you the card</b> sees your name, the phone or email you gave, your stamps, visits, rewards and whether you said yes to offers. Its staff only see your first name, your stamps and the last 4 digits of your phone.</p>
      <p><b>Our service providers</b>, only to run the service and under contract:</p>
      <ul>
        <li>Supabase: rewards database, in Canada.</li>
        <li>Vercel: website and app server hosting. Requests may be processed in the United States.</li>
        <li>Google Analytics and Ahrefs: website visit statistics.</li>
        <li>Resend: delivers form messages and sign in emails.</li>
      </ul>
      <p><b>Google Wallet or Apple Wallet</b>, only if you add a card to your wallet. Google or Apple then keeps that card (your name, stamps and card code) under their own privacy policies.</p>
      <p>We may also share information if the law requires it, to protect people&apos;s safety, or as part of a sale or merger of our business, in which case this policy keeps applying.</p>
    </>,
  },
  {
    id: "outside", h: "Information stored or handled outside Canada",
    body: <p>Our rewards database is in Canada. Some of our service providers (such as our hosting, analytics and email providers, and Google or Apple for wallet cards) may handle information in the United States or other countries, where the law of that country may allow authorities to access it. You can ask our Privacy Officer for written information about our service providers outside Canada and how they handle information.</p>,
  },
  {
    id: "keep", h: "How long we keep it",
    body: <ul>
      <li>Your card details: while your card is active.</li>
      <li>No visit for 2 years: we remove your name, phone and email automatically.</li>
      <li>If you delete your card: your name, phone and email are removed right away, and your card stops working. The business keeps anonymous visit counts that no longer identify you.</li>
      <li>Form messages: as long as needed to handle your request and keep a record of it.</li>
      <li>Staff security codes: 30 days.</li>
      <li>Hosting logs and analytics: as set by those providers.</li>
      <li>Backups are replaced on a regular cycle, so deleted details also leave our backups over time.</li>
    </ul>,
  },
  {
    id: "choices", h: "Your choices and rights",
    body: <>
      <ul>
        <li><b>Delete:</b> in the app go to Account, then Privacy, then Delete all my cards. On the web, open your card and tap Delete my card. Or see <a href="https://wheretoyeg-loyalty.vercel.app/delete-my-data">Delete my data</a>.</li>
        <li><b>Stop offers:</b> tap Stop offers on any card.</li>
        <li><b>See or correct your information:</b> contact the business on your card, or our Privacy Officer.</li>
        <li><b>Withdraw consent</b> for anything that is not needed to run your card, at any time.</li>
      </ul>
      <p>We answer requests within 30 days. If you are not happy with our answer, you can contact the Office of the Information and Privacy Commissioner of Alberta (oipc.ab.ca) or the Office of the Privacy Commissioner of Canada (priv.gc.ca).</p>
    </>,
  },
  {
    id: "security", h: "How we protect it",
    body: <p>Information is encrypted in transit. Each business can only see its own customers, staff can only scan and stamp, and PINs are never stored in plain form. Cards in the app are kept in your phone&apos;s secure storage. If a breach creates a real risk of significant harm, we will notify you and the privacy commissioner as the law requires.</p>,
  },
  {
    id: "kids", h: "Children",
    body: <p>WhereToYEG is not made for children under 13 and we do not knowingly collect information from them. In Quebec, children under 14 need a parent&apos;s consent. If you think a child gave us information, contact us and we will delete it.</p>,
  },
  {
    id: "changes", h: "Changes to this policy",
    body: <p>We will update the date at the top when this policy changes. If a change is important, we will tell you in the app or on the website before it applies.</p>,
  },
  {
    id: "contact", h: "Contact our Privacy Officer",
    body: <p>{OPERATOR.officer}<br />{OPERATOR.name}<br />{OPERATOR.address}<br />Email: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a> (subject: Privacy)<br />Phone: {OPERATOR.phone}</p>,
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      effective="November 13, 2026"
      intro={<p>This explains what WhereToYEG collects, why, who can see it, and the choices you have. We wrote it in plain words on purpose.</p>}
      sections={sections}
    />
  );
}
