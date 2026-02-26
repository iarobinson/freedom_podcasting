/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["media.freedompodcasting.com", "localhost"],
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    }];
  },
};
module.exports = nextConfig;
