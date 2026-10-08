import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ---------------------------------------------------------------------------
  // Images
  // ---------------------------------------------------------------------------
  images: {
    // Domains for external images (extend when object storage is configured)
    remotePatterns: [
      {
        // Cloudflare R2 public bucket — update hostname when configured
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        // AWS S3 — update if using S3-compatible storage
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        // Supabase Storage (if used for images)
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
    // Image formats — WebP first for performance
    formats: ["image/webp", "image/avif"],
  },

  // ---------------------------------------------------------------------------
  // Security headers
  // ---------------------------------------------------------------------------
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },

  // ---------------------------------------------------------------------------
  // Redirects (placeholder — expand as routes are built)
  // ---------------------------------------------------------------------------
  async redirects() {
    return [];
  },

  // ---------------------------------------------------------------------------
  // Experimental features
  // ---------------------------------------------------------------------------
  experimental: {
    // Typed routes for compile-time route safety
    typedRoutes: true,
  },

  // ---------------------------------------------------------------------------
  // TypeScript & ESLint (never ignore errors in production builds)
  // ---------------------------------------------------------------------------
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ---------------------------------------------------------------------------
  // Logging
  // ---------------------------------------------------------------------------
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
