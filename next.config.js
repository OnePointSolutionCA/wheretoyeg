const listingRedirects = require("./redirects.json");

/** @type {import('next').NextConfig} */
// Baseline security headers on every response. No CSP yet (it needs a Report-Only trial first).
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=()" },
];

const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 828, 1080, 1200],
    imageSizes: [128, 256, 384],
  },
  async redirects() {
    return [
      {
        // Old neighborhood slug kept its period; new URLs drop it.
        source: "/neighborhoods/st.-albert",
        destination: "/neighborhoods/st-albert",
        permanent: true,
      },
      {
        source: "/halal-restaurants/:slug",
        destination: "/restaurants/:slug",
        permanent: true,
      },
      ...listingRedirects,
    ];
  },
};
module.exports = nextConfig;
