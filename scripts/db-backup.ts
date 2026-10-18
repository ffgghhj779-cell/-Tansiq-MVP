import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from "fs";
import { join } from "path";

/**
 * Copy SQLite dev.db into prisma/backups/ with a timestamp.
 * For Postgres later: use pg_dump instead.
 */
const dbPath = process.env.DATABASE_URL?.replace(/^file:/, "") || "";
const resolved = dbPath.startsWith("/")
  ? dbPath
  : join(process.cwd(), dbPath.replace(/^\.\//, "") || "prisma/dev.db");

const backupDir = join(process.cwd(), "prisma", "backups");
mkdirSync(backupDir, { recursive: true });

if (!existsSync(resolved)) {
  console.error("Database file not found:", resolved);
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dest = join(backupDir, `dev-${stamp}.db`);
copyFileSync(resolved, dest);

const files = readdirSync(backupDir)
  .filter((f) => f.endsWith(".db"))
  .map((f) => ({ f, m: statSync(join(backupDir, f)).mtimeMs }))
  .sort((a, b) => b.m - a.m);

for (const old of files.slice(10)) {
  try {
    unlinkSync(join(backupDir, old.f));
  } catch {
    /* ignore */
  }
}

console.log(`Backup written: ${dest}`);
console.log(`Retained backups: ${Math.min(files.length, 10)}`);
