/**
 * UrbanNest — Next.js Middleware
 *
 * Handles route protection at the edge before any page/API handler runs.
 * Phase 0: Basic matcher config. Auth middleware added in Phase 2 (Auth.js).
 *
 * Route protection rules (enforced in Phase 2):
 *   /seller/*    → requires SELLER or ADMIN role
 *   /admin/*     → requires ADMIN role
 *   /account/*   → requires any authenticated user
 *   /checkout/*  → requires any authenticated user
 *   /api/seller/* → requires SELLER or ADMIN role (also enforced in handlers)
 *   /api/admin/* → requires ADMIN role (also enforced in handlers)
 */

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Protect these path prefixes.
     * Note: API route handlers also perform their own authorization checks.
     * Middleware provides a fast-fail first layer; it does NOT replace
     * handler-level authorization.
     *
     * Excluded from middleware:
     *   - Static files (_next/static, _next/image)
     *   - Favicon
     *   - Public API routes (auth, products, categories)
     */
    "/account/:path*",
    "/checkout/:path*",
    "/seller/:path*",
    "/admin/:path*",
    "/api/seller/:path*",
    "/api/admin/:path*",
    "/api/account/:path*",
  ],
};
