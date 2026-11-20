import type { NextConfig } from "next";

// Why: the site is plain files on GitHub Pages, so the build exports static HTML into dist/ (docs/adr/0007-next-static-export.md).
const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
