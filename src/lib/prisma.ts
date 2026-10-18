import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Local default only — never invent a SQLite path on Vercel.
 * Style/product APIs fall back to the static catalog when DB is unavailable.
 */
if (!process.env.DATABASE_URL && !process.env.VERCEL) {
  process.env.DATABASE_URL = "file:./prisma/dev.db";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
