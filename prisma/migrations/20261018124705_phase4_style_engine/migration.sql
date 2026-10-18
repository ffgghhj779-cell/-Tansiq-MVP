-- CreateTable
CREATE TABLE "StyleFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tool" TEXT NOT NULL,
    "seedProductId" TEXT NOT NULL DEFAULT '',
    "suggestedProductId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StyleRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'wear',
    "sourceId" TEXT NOT NULL DEFAULT '',
    "targetId" TEXT NOT NULL DEFAULT '',
    "reasonAr" TEXT NOT NULL,
    "reasonEn" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 10,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "metaJson" TEXT NOT NULL DEFAULT '{}'
);
INSERT INTO "new_StyleRule" ("enabled", "id", "key", "reasonAr", "reasonEn", "weight") SELECT "enabled", "id", "key", "reasonAr", "reasonEn", "weight" FROM "StyleRule";
DROP TABLE "StyleRule";
ALTER TABLE "new_StyleRule" RENAME TO "StyleRule";
CREATE UNIQUE INDEX "StyleRule_key_key" ON "StyleRule"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
