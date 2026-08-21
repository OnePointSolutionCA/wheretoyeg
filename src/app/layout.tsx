import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollOrbs } from "@/components/ScrollOrbs";
import { Analytics } from "@/components/Analytics";
import type { SearchIndexItem } from "@/components/HeroSearch";
import { getCategories, getBusinesses } from "@/lib/content";
import { organizationSchema, siteSearchSchema, JsonLd } from "@/lib/schema-extra";
import { SITE } from "@/lib/site";

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "-"); }

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const OG = "/og.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Find the best local businesses in Edmonton`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "Edmonton businesses",
    "Edmonton directory",
    "best restaurants Edmonton",
    "halal food Edmonton",
    "barber Edmonton",
    "walk-in clinic Edmonton",
    "hearing care Edmonton",
    "eye care Edmonton",
    "YEG local",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  openGraph: {
    title: `${SITE.name} — Find the best local businesses in Edmonton`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    locale: "en_CA",
    images: [
      {
        url: OG,
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Find the best local businesses in Edmonton`,
    description: SITE.description,
    images: [OG],
  },
  icons: {
    icon: "/logo-mark.png",
    apple: "/logo-mark.png",
  },
  formatDetection: { telephone: true, address: true, email: true },
  verification: {
    ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
      : {}),
    other: {
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
        : {}),
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#053F52",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cats = getCategories();
  const navCategories = cats.map((c) => ({ name: c.name, slug: c.slug }));
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.name]));
  const searchIndex: SearchIndexItem[] = [
    ...cats.map((c) => ({
      kind: "category" as const,
      name: c.name,
      href: `/${c.slug}`,
      hint: c.description,
    })),
    ...cats.flatMap((c) =>
      (c.subcategories ?? []).map((s) => ({
        kind: "category" as const,
        name: s.name,
        href: `/${c.slug}/${s.slug}`,
        hint: `${c.name} · in Edmonton`,
      })),
    ),
    ...getBusinesses().map((b) => ({
      kind: "business" as const,
      name: b.name,
      href: `/${b.category}/${b.slug}`,
      hint: `${catBySlug[b.category] ?? b.category} · ${b.neighborhood}`,
    })),
    ...SITE.neighborhoods.map((n) => ({
      kind: "neighborhood" as const,
      name: n,
      href: `/neighborhoods/${toSlug(n)}`,
      hint: "Neighborhood",
    })),
  ];
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {/* Sync page-mark so page-home CSS applies BEFORE body paints —
            avoids a flash where the hero renders visible for a frame,
            then jumps hidden after hydration adds the class. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(location.pathname==='/')document.documentElement.classList.add('page-home');`,
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-teal focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Analytics />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={siteSearchSchema()} />
        <ScrollOrbs />
        <Navbar categories={navCategories} searchIndex={searchIndex} />
        <main id="main">{children}</main>
        <Footer />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('scrollRestoration' in history){history.scrollRestoration='manual'}window.addEventListener('beforeunload',function(){window.scrollTo(0,0)});`,
          }}
        />
      </body>
    </html>
  );
}
