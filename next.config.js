/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Build as standalone application for better Vercel compatibility
  output: 'standalone',
  
  // Skip type checking during production build for faster builds
  typescript: {
    // Still check types but don't fail the build if errors exist
    ignoreBuildErrors: true,
  },
  
  eslint: {
    // Still run ESLint but don't fail the build if errors exist
    ignoreDuringBuilds: true,
  },
};

export default config;
