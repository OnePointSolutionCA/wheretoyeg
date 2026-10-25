import { SITE } from "./site";

export type BreadcrumbLink = { name: string; href?: string };

export function breadcrumbSchema(links: BreadcrumbLink[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: links.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: l.name,
      ...(l.href ? { item: l.href.startsWith("http") ? l.href : `${SITE.url}${l.href}` } : {}),
    })),
  };
}

/** ItemList for list pages (summary style: each item links to its own listing page). */
export function itemListSchema(name: string, path: string, items: { name: string; href: string }[], max = 30) {
  const list = items.slice(0, max);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: `${SITE.url}${path}`,
    numberOfItems: list.length,
    itemListElement: list.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.href.startsWith("http") ? it.href : `${SITE.url}${it.href}`,
    })),
  };
}

export type FaqItem = { q: string; a: string };

export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/**
 * Website + SearchAction schema: enables Google to show a sitelinks
 * search box for the domain in the SERP.
 */
export function siteSearchSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en-CA",
    publisher: { "@id": `${SITE.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

// Towns outside Edmonton that have their own area pages on the site.
const NEARBY_TOWNS = ["Sherwood Park", "St. Albert", "Spruce Grove", "Beaumont", "Leduc", "Fort Saskatchewan", "Stony Plain"];

/**
 * Organization schema: helps Google and AI search understand the publisher entity.
 * WhereToYEG is an online directory, so no street address or LocalBusiness type.
 * sameAs is left out on purpose: no public social profile is confirmed yet
 * (checked 2026-10-25). Only add a profile that loads and clearly belongs to the site.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    slogan: SITE.tagline,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}/logo-mark.png`,
      width: 353,
      height: 450,
    },
    image: `${SITE.url}/og.png`,
    email: SITE.email,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SITE.email,
      url: `${SITE.url}/contact`,
      areaServed: "CA",
      availableLanguage: "English",
    },
    areaServed: [
      { "@type": "City", name: "Edmonton", containedInPlace: { "@type": "AdministrativeArea", name: "Alberta" } },
      ...NEARBY_TOWNS.filter((t) => SITE.neighborhoods.includes(t)).map((name) => ({ "@type": "Place", name })),
    ],
  };
}

// "<" is escaped so listing text can never close the script tag; JSON parsers read it back as "<".
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
