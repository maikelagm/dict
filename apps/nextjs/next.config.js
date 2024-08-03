import { fileURLToPath } from "url";
import NextBundleAnalyzer from "@next/bundle-analyzer";
import createJiti from "jiti";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env");

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@dict/api",
    "@dict/auth",
    "@dict/db",
    "@dict/ui",
    "@dict/validators",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

console.log(process.env.NEXT_BUNDLE_ANALYZER);
const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.NEXT_BUNDLE_ANALYZER === "true",
});

export default withBundleAnalyzer(nextConfig);
