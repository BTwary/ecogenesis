import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Do not silently ship a build with TypeScript errors.
  typescript: { ignoreBuildErrors: false },
  reactStrictMode: false,
};

export default nextConfig;
