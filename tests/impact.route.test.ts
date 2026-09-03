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
    it("returns overall totals", async () => {
        const response = await getImpact();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.overall).toEqual({
            totalDonations: 3,
            totalItems: 24,
            totalHealthImpactScore: 21,
            totalEnvironmentalImpactScore: 14,
            totalCO2Saved: 35,
        });
    });

    it("aggregates totals per month in chronological order", async () => {
        const response = await getImpact();
        const body = await response.json();

        expect(body.byMonth.map((m: { month: string }) => m.month)).toEqual([
            "2026-06",
            "2026-07",
            "2026-08",
        ]);
    });
});
