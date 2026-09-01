import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { seedFixtures, clearFixtures } from "./fixtures/donation";
import { DonationRepository } from "@/lib/repositories/donation.repository";
import { ImpactService } from "@/lib/services/impact.service";

const service = new ImpactService(new DonationRepository());

beforeEach(async () => {
    await seedFixtures();
});

afterEach(async () => {
    await clearFixtures();
});

describe("getImpactReport", () => {
    it("sums totals across every donation", async () => {
        const report = await service.getImpactReport();

        expect(report.overall).toEqual({
            totalDonations: 3,
            totalItems: 24,
            totalHealthImpactScore: 21,
            totalEnvironmentalImpactScore: 14,
            totalCO2Saved: 35,
        });
    });

    it("aggregates totals per month in chronological order", async () => {
        const report = await service.getImpactReport();

        expect(report.byMonth.map((m) => m.month)).toEqual(["2026-06", "2026-07", "2026-08"]);
    });

    it("aggregates totals per recipient", async () => {
        const report = await service.getImpactReport();

        expect(report.byRecipient).toHaveLength(2);
        const recipientA = report.byRecipient.find((r) => r.organisation === "Recipient A");
        const recipientB = report.byRecipient.find((r) => r.organisation === "Recipient B");

        expect(recipientA?.totalDonations).toBe(2);
        expect(recipientB?.totalDonations).toBe(1);
    });

    it("aggregates totals per category, including uncategorised items", async () => {
        const report = await service.getImpactReport();

        const categories = report.byCategory.map((c) => c.category);
        expect(categories).toEqual(
            expect.arrayContaining(["Equipment", "Medical Supplies", "Uncategorised"]),
        );
    });
});
