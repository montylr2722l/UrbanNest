import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

/**
 * Server-side authorization check.
 * Re-verifies user role, isActive, and deletedAt status directly from the DB.
 */
export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      isActive: true,
      deletedAt: true,
    },
  });

  if (!user || !user.isActive || user.deletedAt !== null) {
    throw new Error("FORBIDDEN"); // Account disabled or soft-deleted
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role as UserRole)) {
      throw new Error("FORBIDDEN");
    }
  }

  return user;
}
