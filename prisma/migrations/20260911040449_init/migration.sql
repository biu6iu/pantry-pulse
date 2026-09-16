-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "desc" TEXT,
    "recipientId" TEXT NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "state" TEXT,
    "country" TEXT,
    "phone" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonatedItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "category" TEXT,

    CONSTRAINT "DonatedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationEntry" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "DonationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthImpact" (
    "id" TEXT NOT NULL,
    "donationEntryId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HealthImpact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentalImpact" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "co2Saved" DOUBLE PRECISION NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EnvironmentalImpact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HealthImpact_donationEntryId_key" ON "HealthImpact"("donationEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "EnvironmentalImpact_donationId_key" ON "EnvironmentalImpact"("donationId");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationEntry" ADD CONSTRAINT "DonationEntry_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationEntry" ADD CONSTRAINT "DonationEntry_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "DonatedItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthImpact" ADD CONSTRAINT "HealthImpact_donationEntryId_fkey" FOREIGN KEY ("donationEntryId") REFERENCES "DonationEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalImpact" ADD CONSTRAINT "EnvironmentalImpact_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
