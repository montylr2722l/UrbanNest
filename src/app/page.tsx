/**
 * UrbanNest — Homepage
 *
 * Phase 0: This is a placeholder that confirms the Next.js app is running.
 * The real homepage (Phase 7+) will feature:
 *   - Brand hero with search
 *   - Location-aware product discovery
 *   - Category navigation
 *   - Trending products
 *   - Nearby stores
 *   - New arrivals
 *   - Trust signals
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UrbanNest — Discover Your Style, Closer.",
  description:
    "Fashion-first multi-vendor marketplace. Shop from local stores and online sellers across India.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="container-main py-24 text-center">
        {/* Brand mark */}
        <div className="mb-8 inline-flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-950">
            <span className="font-display text-2xl font-bold text-white">U</span>
          </div>
        </div>

        {/* Wordmark */}
        <h1 className="mb-4 text-5xl font-semibold tracking-tight text-ink-950 sm:text-6xl">
          UrbanNest
        </h1>

        {/* Tagline */}
        <p className="mb-12 text-xl font-light text-ink-500 sm:text-2xl">
          Discover Your Style, Closer.
        </p>

        {/* Phase indicator */}
        <div className="mx-auto max-w-md rounded-xl border border-ink-100 bg-ink-50 p-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink-400">
            Build Status
          </p>
          <p className="text-lg font-medium text-ink-700">
            Phase 0 — Foundation Complete
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Database schema designed. Core utilities ready.
            Authentication and storefront coming next.
          </p>
        </div>

        {/* Technology stack indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {[
            "Next.js 15",
            "TypeScript",
            "Prisma",
            "PostgreSQL",
            "Tailwind CSS",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
