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
    it("sums totals across completed donations", async () => {
        const report = await service.getImpactReport();

        expect(report.overall).toEqual({
            totalDonations: 2,
            totalItems: 14,
            totalUnitsDelivered: 143,
            totalWeightDivertedKg: 19,
            totalCO2eAvoidedKg: 74,
            averageHealthImpactScore: 2.6,
        });
    });

    it("passes filters through to every breakdown", async () => {
        const report = await service.getImpactReport({ country: "US" });

        expect(report.overall.totalDonations).toBe(1);
        expect(report.byRecipient.map((r) => r.organisation)).toEqual(["Recipient A"]);
        expect(report.byMonth.map((m) => m.month)).toEqual(["2026-08"]);
        expect(report.byCategory.reduce((sum, c) => sum + c.totalItems, 0)).toBe(7);
        expect(report.byItem.map((i) => i.name)).toEqual(["IV Giving Set", "Infusion Pump"]);
        expect(report.byLocation.map((l) => l.city)).toEqual(["Cleveland"]);
    });

    it("aggregates totals per month in chronological order", async () => {
        const report = await service.getImpactReport();

        expect(report.byMonth.map((m) => m.month)).toEqual(["2026-06", "2026-08"]);
    });

    it("aggregates totals per recipient", async () => {
        const report = await service.getImpactReport();

        expect(report.byRecipient).toHaveLength(2);
        const recipientA = report.byRecipient.find((r) => r.organisation === "Recipient A");
        const recipientB = report.byRecipient.find((r) => r.organisation === "Recipient B");

        expect(recipientA?.totalDonations).toBe(1);
        expect(recipientB?.totalDonations).toBe(1);
    });

    it("ranks the top donated items by quantity", async () => {
        const report = await service.getImpactReport();

        expect(report.byItem.map((i) => [i.name, i.totalItems])).toEqual([
            ["IV Giving Set", 7],
            ["Bandages", 4],
            ["Infusion Pump", 3],
        ]);
    });

    it("lists the locations reached with their deliveries", async () => {
        const report = await service.getImpactReport();

        expect(report.byLocation.map((l) => [l.city, l.state, l.totalDonations])).toEqual([
            ["Cleveland", "OH", 1],
            ["Shanghai", "SH", 1],
        ]);
    });

    it("aggregates totals per category, including uncategorised items", async () => {
        const report = await service.getImpactReport();

        const categories = report.byCategory.map((c) => c.category);
        expect(categories).toEqual(
            expect.arrayContaining(["Equipment", "Medical Supplies", "Uncategorised"]),
        );
    });
});
