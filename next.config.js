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
        source: "/halal-restaurants",
        destination: "/restaurants?amenity=Halal",
        permanent: true,
      },
      {
        source: "/halal-restaurants/:slug",
        destination: "/restaurants/:slug",
        permanent: true,
      },
    ];
  },
};
module.exports = nextConfig;
