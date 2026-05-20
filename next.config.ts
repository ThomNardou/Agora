import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  env: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  },
};

export default nextConfig;
