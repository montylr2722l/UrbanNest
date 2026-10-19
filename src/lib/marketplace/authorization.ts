import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";
import type { UserRole } from "@prisma/client";

export async function requireMarketplaceRole(role: UserRole) {
  const user = await requireAuth([role]);
  if (role === "SELLER") {
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { isActive: true, isSuspended: true },
    });
    if (!profile?.isActive || profile.isSuspended) throw new Error("SELLER_NOT_APPROVED");
  }
  return user;
}
