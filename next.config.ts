import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // A stray package-lock.json in the parent directory makes Next infer the
    // wrong workspace root. Pin it to this project.
    root: __dirname,
  },
  images: {
    // Next 16 restricts quality values to this list.
    qualities: [75, 90],
  },
};

export default nextConfig;
