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
 * Website + SearchAction schema — enables Google to show a sitelinks
 * search box for the domain in the SERP.
 */
export function siteSearchSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Organization schema — helps Google understand the publisher entity.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/logo-mark.png`,
    email: SITE.deliveryEmail,
    sameAs: [SITE.social.instagram, SITE.social.tiktok],
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
