export type LoginRole = "CUSTOMER" | "SELLER" | "ADMIN";

const DEFAULT_DESTINATIONS: Record<LoginRole, string> = {
  CUSTOMER: "/account",
  SELLER: "/seller",
  ADMIN: "/admin",
};

export function getDefaultLoginDestination(role: string | undefined): string | null {
  if (role === "CUSTOMER" || role === "SELLER" || role === "ADMIN") {
    return DEFAULT_DESTINATIONS[role];
  }
  return null;
}

/** Return only a same-origin destination that Next.js can navigate to locally. */
export function getSafeCallbackDestination(
  callbackUrl: string | null | undefined,
  origin: string,
): string | null {
  if (!callbackUrl || callbackUrl.startsWith("//") || /[\\\u0000-\u001f]/.test(callbackUrl)) {
    return null;
  }

  try {
    const trustedOrigin = new URL(origin).origin;
    const destination = new URL(callbackUrl, trustedOrigin);
    if (destination.origin !== trustedOrigin) return null;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return null;
  }
}
