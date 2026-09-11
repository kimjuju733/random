import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/random",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
