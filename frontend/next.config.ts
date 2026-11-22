import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only the production Docker image needs the standalone server output
  output: process.env.NEXT_STANDALONE === "true" ? "standalone" : undefined,
  allowedDevOrigins: ["129.161.139.75"],
  async rewrites() {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.INTERNAL_API_URL || "http://localhost:8000"}/:path*/`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
