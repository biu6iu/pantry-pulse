import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { seedFixtures, clearFixtures } from "./fixtures/donation";
import { DonationRepository } from "@/lib/repositories/donation.repository";

const repo = new DonationRepository();

beforeEach(async () => {
    await seedFixtures();
});

afterEach(async () => {
    await clearFixtures();
});

describe("getImpactByRecipient", () => {
    it("does not double-count environmental impact across multiple entries", async () => {
        const results = await repo.getImpactByRecipient();
        const recipientA = results.find((r) => r.organisation === "Recipient A");

        expect(recipientA?.totalEnvironmentalImpactScore).toBe(8);
    });

    it("aggregates totals per recipient across all of their donations", async () => {
        const results = await repo.getImpactByRecipient();
        const recipientA = results.find((r) => r.organisation === "Recipient A");
        const recipientB = results.find((r) => r.organisation === "Recipient B");

        // FIX totalDonations/totalItems come back as BigInt not number
        expect(recipientA?.totalDonations).toBe(BigInt(2));
        expect(recipientA?.totalItems).toBe(BigInt(17));
        expect(recipientA?.totalHealthImpactScore).toBe(15);
        expect(recipientA?.totalCO2Saved).toBe(20);

        expect(recipientB?.totalDonations).toBe(BigInt(1));
        expect(recipientB?.totalItems).toBe(BigInt(7));
        expect(recipientB?.totalHealthImpactScore).toBe(6);
        expect(recipientB?.totalEnvironmentalImpactScore).toBe(6);
        expect(recipientB?.totalCO2Saved).toBe(15);
    });
});

describe("getImpactByCategory", () => {
    it("aggregates item counts and health impact scores per category", async () => {
        const results = await repo.getImpactByCategory();
        const equipment = results.find((r) => r.category === "Equipment");
        const medicalSupplies = results.find((r) => r.category === "Medical Supplies");
        const uncategorised = results.find((r) => r.category === "Uncategorised");

        expect(equipment?.totalItems).toBe(BigInt(3));
        expect(equipment?.totalHealthImpactScore).toBe(13);

        expect(medicalSupplies?.totalItems).toBe(BigInt(7));
        expect(medicalSupplies?.totalHealthImpactScore).toBe(7);

        expect(uncategorised?.totalItems).toBe(BigInt(14));
        expect(uncategorised?.totalHealthImpactScore).toBe(1);
    });
});

describe("getImpactByMonth", () => {
    it("aggregates totals per month in chronological order", async () => {
        const results = await repo.getImpactByMonth();

        expect(results.map((r) => r.month)).toEqual(["2026-06", "2026-07", "2026-08"]);

        const june = results.find((r) => r.month === "2026-06");
        const july = results.find((r) => r.month === "2026-07");
        const august = results.find((r) => r.month === "2026-08");

        expect(june).toMatchObject({
            totalDonations: BigInt(1),
            totalItems: BigInt(7),
            totalHealthImpactScore: 6,
            totalEnvironmentalImpactScore: 6,
        });
        expect(july).toMatchObject({
            totalDonations: BigInt(1),
            totalItems: BigInt(10),
            totalHealthImpactScore: 0,
            totalEnvironmentalImpactScore: 0,
        });
        expect(august).toMatchObject({
            totalDonations: BigInt(1),
            totalItems: BigInt(7),
            totalHealthImpactScore: 15,
            totalEnvironmentalImpactScore: 8,
        });
    });
});

describe("getOverallImpactSummary", () => {
    it("sums totals across every donation", async () => {
        const result = await repo.getOverallImpactSummary();

        expect(result).toEqual({
            totalDonations: 3,
            totalItems: 24,
            totalHealthImpactScore: 21,
            totalEnvironmentalImpactScore: 14,
            totalCO2Saved: 35,
        });
    });
});

describe("getAll", () => {
    it("returns every donation with its entries and mapped status", async () => {
        const results = await repo.getAll();

        expect(results).toHaveLength(3);

        const donationA1 = results.find((d) => d.id === "#TEST-A1");
        expect(donationA1?.status).toBe("COMPLETED");
        expect(donationA1?.entries).toHaveLength(2);
        expect(donationA1?.getTotalItems()).toBe(7);

        const donationA2 = results.find((d) => d.id === "#TEST-A2");
        expect(donationA2?.status).toBe("OPEN");
        expect(donationA2?.entries).toHaveLength(1);

        const donationB1 = results.find((d) => d.id === "#TEST-B1");
        expect(donationB1?.status).toBe("COMPLETED");
        expect(donationB1?.entries).toHaveLength(3);
        expect(donationB1?.getTotalItems()).toBe(7);
    });
});

describe("getById", () => {
    it("returns a single donation with its entries", async () => {
        const donation = await repo.getById("#TEST-B1");

        expect(donation?.id).toBe("#TEST-B1");
        expect(donation?.status).toBe("COMPLETED");
        expect(donation?.entries).toHaveLength(3);
        expect(donation?.getTotalItems()).toBe(7);
    });

    it("returns null for an unknown id", async () => {
        const donation = await repo.getById("#does-not-exist");

        expect(donation).toBeNull();
    });
});
