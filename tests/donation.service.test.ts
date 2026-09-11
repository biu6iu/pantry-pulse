import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { seedFixtures, clearFixtures } from "./fixtures/donation";
import { DonationRepository } from "@/lib/repositories/donation.repository";
import { DonationService } from "@/lib/services/donation.service";

const service = new DonationService(new DonationRepository());

beforeEach(async () => {
    await seedFixtures();
});

afterEach(async () => {
    await clearFixtures();
});

describe("listDonations", () => {
    it("returns a summary DTO per donation", async () => {
        const results = await service.listDonations();

        expect(results).toHaveLength(3);

        const donationA1 = results.find((d) => d.id === "#TEST-A1");
        expect(donationA1).toMatchObject({
            status: "COMPLETED",
            receiver: { organisation: "Recipient A" },
            totalItems: 7,
            healthImpactScore: 15,
            environmentalImpactScore: 8,
        });

        const donationA2 = results.find((d) => d.id === "#TEST-A2");
        expect(donationA2).toMatchObject({
            status: "OPEN",
            receiver: { organisation: "Recipient A" },
            totalItems: 10,
            healthImpactScore: null,
            environmentalImpactScore: null,
        });

        const donationB1 = results.find((d) => d.id === "#TEST-B1");
        expect(donationB1).toMatchObject({
            status: "COMPLETED",
            receiver: { organisation: "Recipient B" },
            totalItems: 7,
            healthImpactScore: 6,
            environmentalImpactScore: 6,
        });
    });
});

describe("getDonationDetail", () => {
    it("aggregates health impact across entries and includes item/receiver details", async () => {
        const donation = await service.getDonationDetail("#TEST-A1");

        expect(donation?.receiver.organisation).toBe("Recipient A");
        expect(donation?.items).toEqual([
            {
                entryId: expect.any(String),
                itemId: expect.any(String),
                itemName: "Infusion Pump",
                category: "Equipment",
                quantity: 2,
            },
            {
                entryId: expect.any(String),
                itemId: expect.any(String),
                itemName: "IV Giving Set",
                category: "Medical Supplies",
                quantity: 5,
            },
        ]);
        expect(donation?.healthImpact).toEqual({ score: 15 });
        expect(donation?.environmentalImpact).toEqual({ estimatedCO2Saved: 20, score: 8 });
        expect(donation?.totalItems).toBe(7);
    });

    it("falls back to uncategorised and nulls out missing impacts", async () => {
        const donation = await service.getDonationDetail("#TEST-A2");

        expect(donation?.items[0]?.category).toBe("Uncategorised");
        expect(donation?.healthImpact).toBeNull();
        expect(donation?.environmentalImpact).toBeNull();
    });

    it("returns null for an unknown id", async () => {
        const donation = await service.getDonationDetail("#does-not-exist");

        expect(donation).toBeNull();
    });
});
