import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { seedFixtures, clearFixtures } from "./fixtures/donation";
import { GET as getImpact } from "@/app/api/impact/route";
import { NextRequest } from "next/server";

beforeEach(async () => {
    await seedFixtures();
});

afterEach(async () => {
    await clearFixtures();
});

describe("GET /api/impact", () => {
    it("returns overall totals for completed donations", async () => {
        const response = await getImpact(new NextRequest("http://localhost/api/impact"));
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
        const response = await getImpact(new NextRequest("http://localhost/api/impact"));
        const body = await response.json();

        expect(body.byMonth.map((m: { month: string }) => m.month)).toEqual([
            "2026-06",
            "2026-08",
        ]);
    });
});


describe("GET /api/impact query parameters", () => {
    it("filters every figure by region", async () => {
        const response = await getImpact(new NextRequest("http://localhost/api/impact?country=US"));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.overall.totalDonations).toBe(1);
        expect(body.byRecipient.map((r: { organisation: string }) => r.organisation)).toEqual(["Recipient A"]);
        expect(body.byItem.map((i: { name: string }) => i.name)).toEqual(["IV Giving Set", "Infusion Pump"]);
        expect(body.byLocation.map((l: { city: string }) => l.city)).toEqual(["Cleveland"]);
    });

    it("filters every figure by date range", async () => {
        const response = await getImpact(
            new NextRequest("http://localhost/api/impact?from=2026-08-01&to=2026-08-31"),
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.overall.totalDonations).toBe(1);
        expect(body.byMonth.map((m: { month: string }) => m.month)).toEqual(["2026-08"]);
    });

    it("returns 400 with a clear message for an invalid filter", async () => {
        const response = await getImpact(new NextRequest("http://localhost/api/impact?from=not-a-date"));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "Invalid from date: not-a-date" });
    });
});
