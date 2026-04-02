import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.fliegenfischer-schule.shop",
          },
        ],
        destination: "https://fliegenfischer-schule.shop/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
