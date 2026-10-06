import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { seedFixtures, clearFixtures } from "./fixtures/donation";
import { DonationRepository } from "@/lib/repositories/donation.repository";
import { DonationService } from "@/lib/services/donation.service";

const service = new DonationService(new DonationRepository());

let fixtures: Awaited<ReturnType<typeof seedFixtures>>;

beforeEach(async () => {
    fixtures = await seedFixtures();
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
            healthImpactScore: 2.57,
            weightDivertedKg: 13,
            co2eAvoidedKg: 50,
        });

        const donationA2 = results.find((d) => d.id === "#TEST-A2");
        expect(donationA2).toMatchObject({
            status: "OPEN",
            receiver: { organisation: "Recipient A" },
            totalItems: 10,
            healthImpactScore: null,
            weightDivertedKg: null,
            co2eAvoidedKg: null,
        });

        const donationB1 = results.find((d) => d.id === "#TEST-B1");
        expect(donationB1).toMatchObject({
            status: "COMPLETED",
            receiver: { organisation: "Recipient B" },
            totalItems: 7,
            healthImpactScore: 2.67,
            weightDivertedKg: 6,
            co2eAvoidedKg: 24,
        });
    });
});

describe("listDonations filters", () => {
    it("forwards filters through to the repository instead of dropping them", async () => {
        const open = await service.listDonations({ status: "OPEN" });
        expect(open.map((d) => d.id)).toEqual(["#TEST-A2"]);

        const forRecipientB = await service.listDonations({ recipientId: fixtures.recipientB.id });
        expect(forRecipientB.map((d) => d.id)).toEqual(["#TEST-B1"]);

        const paged = await service.listDonations({ limit: 1, offset: 1 });
        expect(paged.map((d) => d.id)).toEqual(["#TEST-A2"]);
    });
});

describe("getDonationDetail", () => {
    it("calculates impact across entries and includes item/receiver details", async () => {
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
        // (2 pumps x 4 + 5 giving sets x 2) / 7 items
        expect(donation?.healthImpact).toEqual({ score: 2.57 });
        expect(donation?.environmentalImpact).toEqual({
            unitsDelivered: 102,
            weightDivertedKg: 13,
            co2eAvoidedKg: 50,
        });
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
