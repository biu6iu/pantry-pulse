-- Impact figures are now calculated from DonatedItem factors instead of being stored

-- DropForeignKey
ALTER TABLE "HealthImpact" DROP CONSTRAINT "HealthImpact_donationEntryId_fkey";

-- DropForeignKey
ALTER TABLE "EnvironmentalImpact" DROP CONSTRAINT "EnvironmentalImpact_donationId_fkey";

-- DropTable
DROP TABLE "HealthImpact";

-- DropTable
DROP TABLE "EnvironmentalImpact";
