import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { seedFixtures, clearFixtures } from "./fixtures/donation";
import { GET as getImpact } from "@/app/api/impact/route";

beforeEach(async () => {
    await seedFixtures();
});

afterEach(async () => {
    await clearFixtures();
});

describe("GET /api/impact", () => {
    it("returns overall totals for completed donations", async () => {
        const response = await getImpact();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.overall).toEqual({
            totalDonations: 2,
            totalItems: 14,
            totalUnitsDelivered: 143,
            totalWeightDivertedKg: 19,
            totalCO2eAvoidedKg: 74,
            averageHealthImpactScore: 2.6,
        });
    });

    it("aggregates totals per month in chronological order", async () => {
        const response = await getImpact();
        const body = await response.json();

        expect(body.byMonth.map((m: { month: string }) => m.month)).toEqual([
            "2026-06",
            "2026-08",
        ]);
    });
});
