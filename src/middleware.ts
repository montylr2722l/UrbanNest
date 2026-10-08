/**
 * UrbanNest — Next.js Middleware
 *
 * Phase 0:
 * Route matcher configuration only.
 *
 * Authentication and role-based protection will be added
 * when the authentication phase is implemented.
 */

export const config = {
  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    "/seller/:path*",
    "/admin/:path*",
    "/api/seller/:path*",
    "/api/admin/:path*",
    "/api/account/:path*",
  ],
};