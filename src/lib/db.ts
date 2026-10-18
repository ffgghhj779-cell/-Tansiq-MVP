/**
 * Database availability helper.
 * Local: SQLite via DATABASE_URL=file:./prisma/dev.db
 * Vercel: requires Postgres (Neon/Supabase). SQLite file URLs are treated as unavailable.
 */

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  // Serverless has no durable local filesystem for SQLite
  if (process.env.VERCEL && (url.startsWith("file:") || url.includes("dev.db"))) {
    return false;
  }
  return true;
}
