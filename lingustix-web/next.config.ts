import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // ADD THIS SECTION
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://app:8080/:path*',
      },
    ];
  },
};

export default nextConfig;