/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
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
