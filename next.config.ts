import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Trace the server and its dependencies into `.next/standalone`, so the
  // production image carries a `server.js` and only the node_modules it
  // actually reached for. See `Dockerfile` — `public/` and `.next/static` are
  // not traced and have to be copied in alongside it.
  output: "standalone",
  turbopack: {
    // A stray package-lock.json in the parent directory makes Next infer the
    // wrong workspace root. Pin it to this project.
    root: __dirname,
  },
  images: {
    // Next 16 restricts quality values to this list.
    qualities: [75, 90],
  },
  async redirects() {
    return [
      // /case-studies was live briefly before the collection was renamed to
      // /reference-deployments. The index redirects; the individual documents
      // deliberately do not, because their slugs were named after customers we
      // do not have and those URLs should die rather than be kept alive.
      {
        source: "/case-studies",
        destination: "/reference-deployments",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
