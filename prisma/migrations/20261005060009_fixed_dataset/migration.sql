-- AlterTable
ALTER TABLE "DonatedItem" ADD COLUMN     "co2eKgPerUnit" DOUBLE PRECISION,
ADD COLUMN     "co2eSource" TEXT,
ADD COLUMN     "healthImpactTier" INTEGER,
ADD COLUMN     "unitWeightKg" DOUBLE PRECISION,
ADD COLUMN     "unitsPerPack" INTEGER,
ADD COLUMN     "weightSource" TEXT;

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "deliveryMethod" TEXT,
ADD COLUMN     "shopifyOrderId" TEXT;

-- AlterTable
ALTER TABLE "DonationEntry" ADD COLUMN     "lineNo" INTEGER,
ADD COLUMN     "variant" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "type" TEXT,
ALTER COLUMN "email" DROP NOT NULL;
