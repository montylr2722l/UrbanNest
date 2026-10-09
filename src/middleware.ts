import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

/**
 * UrbanNest — Next.js Middleware
 *
 * Phase 1: Authentication and role-based protection.
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

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const isActive = req.auth?.user?.isActive;
  // Use loose check for undefined since the session might not serialize it perfectly, but usually it does.
  const isDeleted = req.auth?.user?.deletedAt != null;

  // Unauthenticated users redirect to login
  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  // Account status check (fast edge-level guard)
  if (isActive === false || isDeleted) {
    return NextResponse.json({ error: "Account disabled or suspended" }, { status: 403 });
  }

  // Role-Based Access Control (RBAC) at Edge
  if (nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/api/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
    }
  }

  if (nextUrl.pathname.startsWith("/seller") || nextUrl.pathname.startsWith("/api/seller")) {
    if (role !== "SELLER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Sellers only" }, { status: 403 });
    }
  }

  return NextResponse.next();
});