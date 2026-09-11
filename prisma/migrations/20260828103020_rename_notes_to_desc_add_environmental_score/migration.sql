/*
  Warnings:

  - You are about to drop the column `notes` on the `Donation` table. All the data in the column will be lost.
  - Added the required column `score` to the `EnvironmentalImpact` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "desc" TEXT,
    "recipientId" TEXT NOT NULL,
    CONSTRAINT "Donation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Donation" ("completedAt", "createdAt", "id", "recipientId", "status") SELECT "completedAt", "createdAt", "id", "recipientId", "status" FROM "Donation";
DROP TABLE "Donation";
ALTER TABLE "new_Donation" RENAME TO "Donation";
CREATE TABLE "new_EnvironmentalImpact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donationId" TEXT NOT NULL,
    "co2Saved" REAL NOT NULL,
    "score" REAL NOT NULL,
    CONSTRAINT "EnvironmentalImpact_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EnvironmentalImpact" ("co2Saved", "donationId", "id") SELECT "co2Saved", "donationId", "id" FROM "EnvironmentalImpact";
DROP TABLE "EnvironmentalImpact";
ALTER TABLE "new_EnvironmentalImpact" RENAME TO "EnvironmentalImpact";
CREATE UNIQUE INDEX "EnvironmentalImpact_donationId_key" ON "EnvironmentalImpact"("donationId");
CREATE TABLE "new_HealthImpact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donationEntryId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    CONSTRAINT "HealthImpact_donationEntryId_fkey" FOREIGN KEY ("donationEntryId") REFERENCES "DonationEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HealthImpact" ("donationEntryId", "id", "score") SELECT "donationEntryId", "id", "score" FROM "HealthImpact";
DROP TABLE "HealthImpact";
ALTER TABLE "new_HealthImpact" RENAME TO "HealthImpact";
CREATE UNIQUE INDEX "HealthImpact_donationEntryId_key" ON "HealthImpact"("donationEntryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
