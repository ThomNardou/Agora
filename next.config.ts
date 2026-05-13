import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
  },
};

export default nextConfig;
