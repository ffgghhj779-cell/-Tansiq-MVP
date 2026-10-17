import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cloud/agent browsers and local probes on 127.0.0.1
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
