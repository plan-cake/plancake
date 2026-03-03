import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["129.161.139.75"],
  async rewrites() {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
      return [
        {
          source: "/api/:path*",
          destination: "http://127.0.0.1:8000/:path*/",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
