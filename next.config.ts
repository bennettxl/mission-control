import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/": ["./dev.db"],
  },
};

export default nextConfig;
