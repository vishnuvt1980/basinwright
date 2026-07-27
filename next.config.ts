import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 restricts quality values to this list.
    qualities: [75, 90],
  },
};

export default nextConfig;
