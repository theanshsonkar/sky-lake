import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dashboard Browser panel frames the dev server from a swapped loopback
  // host; Next 16 blocks cross-origin dev resources by default, which breaks
  // CSS/HMR inside the panel. Allow the loopback hosts explicitly.
  allowedDevOrigins: ["127.0.0.1", "localhost", "[::1]"],
};

export default nextConfig;
