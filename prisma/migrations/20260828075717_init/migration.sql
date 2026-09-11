-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "notes" TEXT,
    "recipientId" TEXT NOT NULL,
    CONSTRAINT "Donation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "province" TEXT,
    "country" TEXT,
    "phone" TEXT
);

-- CreateTable
CREATE TABLE "DonatedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "category" TEXT
);

-- CreateTable
CREATE TABLE "DonationEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donationId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "DonationEntry_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DonationEntry_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "DonatedItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthImpact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donationEntryId" TEXT NOT NULL,
    "score" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "EnvironmentalImpact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donationId" TEXT NOT NULL,
    "co2Saved" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
