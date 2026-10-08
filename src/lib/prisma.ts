/**
 * UrbanNest — Prisma Client Singleton
 *
 * In development, Next.js hot-reloading creates new module instances on
 * every reload, which would exhaust the database connection pool.
 * This singleton pattern reuses the Prisma client across hot-reloads.
 *
 * In production, a fresh client is created once.
 *
 * IMPORTANT: Never import PrismaClient directly in components or route
 * handlers — always import this singleton.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
