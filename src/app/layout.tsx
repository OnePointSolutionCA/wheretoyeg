import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollOrbs } from "@/components/ScrollOrbs";
import { Analytics } from "@/components/Analytics";
import { getCategories } from "@/lib/content";
import { organizationSchema, siteSearchSchema, JsonLd } from "@/lib/schema-extra";
import { SITE } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

const OG = "/og.png";

const DEFAULT_TITLE = `Edmonton Business Directory | ${SITE.name}`;
const DEFAULT_DESCRIPTION =
  "Find the best restaurants, barbers, dentists, mechanics and things to do in Edmonton, Sherwood Park and St. Albert, with Google ratings, hours and directions.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE.name}`,
  },
  description: DEFAULT_DESCRIPTION,
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
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    locale: "en_CA",
    images: [
      {
        url: OG,
        width: 1200,
        height: 630,
        alt: `${SITE.name}: ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
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
  minimumScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cats = getCategories();
  const navCategories = cats.map((c) => ({ name: c.name, slug: c.slug }));
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if('scrollRestoration' in history)history.scrollRestoration='manual';window.scrollTo(0,0);if(location.pathname==='/'&&!sessionStorage.getItem('intro-played'))document.documentElement.classList.add('page-home')}catch(e){}`,
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
        <Navbar categories={navCategories} />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
