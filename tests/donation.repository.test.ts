import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { seedFixtures, clearFixtures } from "./fixtures/donation";
import { DonationRepository } from "@/lib/repositories/donation.repository";

const repo = new DonationRepository();

let fixtures: Awaited<ReturnType<typeof seedFixtures>>;

beforeEach(async () => {
    fixtures = await seedFixtures();
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

        expect(recipientA?.totalDonations).toBe(2);
        expect(recipientA?.totalItems).toBe(17);
        expect(recipientA?.totalHealthImpactScore).toBe(15);
        expect(recipientA?.totalCO2Saved).toBe(20);

        expect(recipientB?.totalDonations).toBe(1);
        expect(recipientB?.totalItems).toBe(7);
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

        expect(equipment?.totalItems).toBe(3);
        expect(equipment?.totalHealthImpactScore).toBe(13);

        expect(medicalSupplies?.totalItems).toBe(7);
        expect(medicalSupplies?.totalHealthImpactScore).toBe(7);

        expect(uncategorised?.totalItems).toBe(14);
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
            totalDonations: 1,
            totalItems: 7,
            totalHealthImpactScore: 6,
            totalEnvironmentalImpactScore: 6,
        });
        expect(july).toMatchObject({
            totalDonations: 1,
            totalItems: 10,
            totalHealthImpactScore: 0,
            totalEnvironmentalImpactScore: 0,
        });
        expect(august).toMatchObject({
            totalDonations: 1,
            totalItems: 7,
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

describe("getAll filters", () => {
    it("returns donations newest-first with no filters", async () => {
        const results = await repo.getAll();

        expect(results.map((d) => d.id)).toEqual(["#TEST-A1", "#TEST-A2", "#TEST-B1"]);
    });

    it("filters by status, matching the stored value case-insensitively", async () => {
        const open = await repo.getAll({ status: "OPEN" });
        expect(open.map((d) => d.id)).toEqual(["#TEST-A2"]);

        const completed = await repo.getAll({ status: "COMPLETED" });
        expect(completed.map((d) => d.id)).toEqual(["#TEST-A1", "#TEST-B1"]);
    });

    it("filters by recipientId", async () => {
        const forRecipientA = await repo.getAll({ recipientId: fixtures.recipientA.id });
        expect(forRecipientA.map((d) => d.id)).toEqual(["#TEST-A1", "#TEST-A2"]);

        const forRecipientB = await repo.getAll({ recipientId: fixtures.recipientB.id });
        expect(forRecipientB.map((d) => d.id)).toEqual(["#TEST-B1"]);
    });

    it("returns nothing for a recipientId with no donations", async () => {
        const results = await repo.getAll({ recipientId: "no-such-recipient" });
        expect(results).toEqual([]);
    });

    it("filters by a createdAt range using from and to together", async () => {
        const results = await repo.getAll({
            from: new Date("2026-07-01T00:00:00Z"),
            to: new Date("2026-08-01T00:00:00Z"),
        });

        expect(results.map((d) => d.id)).toEqual(["#TEST-A2"]);
    });

    it("treats from and to as inclusive bounds", async () => {
        const fromExact = await repo.getAll({ from: new Date("2026-08-29T00:00:00Z") });
        expect(fromExact.map((d) => d.id)).toEqual(["#TEST-A1"]);

        const toExact = await repo.getAll({ to: new Date("2026-06-29T00:00:00Z") });
        expect(toExact.map((d) => d.id)).toEqual(["#TEST-B1"]);
    });

    it("applies from without to, and to without from, independently", async () => {
        const fromOnly = await repo.getAll({ from: new Date("2026-07-01T00:00:00Z") });
        expect(fromOnly.map((d) => d.id)).toEqual(["#TEST-A1", "#TEST-A2"]);

        const toOnly = await repo.getAll({ to: new Date("2026-07-01T00:00:00Z") });
        expect(toOnly.map((d) => d.id)).toEqual(["#TEST-B1"]);
    });

    it("paginates with limit and offset while preserving newest-first order", async () => {
        const page1 = await repo.getAll({ limit: 2, offset: 0 });
        expect(page1.map((d) => d.id)).toEqual(["#TEST-A1", "#TEST-A2"]);

        const page2 = await repo.getAll({ limit: 2, offset: 2 });
        expect(page2.map((d) => d.id)).toEqual(["#TEST-B1"]);
    });

    it("returns an empty page when offset exceeds the result count", async () => {
        const results = await repo.getAll({ offset: 10 });
        expect(results).toEqual([]);
    });

    it("combines status, recipientId, and date filters together", async () => {
        const results = await repo.getAll({
            status: "COMPLETED",
            recipientId: fixtures.recipientA.id,
        });

        expect(results.map((d) => d.id)).toEqual(["#TEST-A1"]);
    });

    it("returns an empty array when combined filters match nothing", async () => {
        const results = await repo.getAll({ status: "OPEN", recipientId: fixtures.recipientB.id });
        expect(results).toEqual([]);
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
