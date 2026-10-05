const listingRedirects = require("./redirects.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
