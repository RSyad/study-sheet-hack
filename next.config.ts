import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Prevents minor lint warnings from breaking Vercel deploys!
  },
  typescript: {
    ignoreBuildErrors: true, // Hackathon safety net so strict types never block your live URL
  },
};

export default nextConfig;
