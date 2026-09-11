import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { seedFixtures, clearFixtures } from "./fixtures/donation";
import { GET as getDonations } from "@/app/api/donations/route";
import { GET as getDonation } from "@/app/api/donations/[id]/route";

beforeEach(async () => {
    await seedFixtures();
});

afterEach(async () => {
    await clearFixtures();
});

describe("GET /api/donations", () => {
    it("returns a summary DTO per donation", async () => {
        const response = await getDonations();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toHaveLength(3);

        const donationA1 = body.find((d: { id: string }) => d.id === "#TEST-A1");
        expect(donationA1).toMatchObject({ totalItems: 7, healthImpactScore: 15 });
    });
});

describe("GET /api/donations/[id]", () => {
    it("returns donation detail for a known id", async () => {
        const request = new NextRequest("http://localhost/api/donations/%23TEST-A1");
        const response = await getDonation(request, {
            params: Promise.resolve({ id: "#TEST-A1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.receiver.organisation).toBe("Recipient A");
        expect(body.healthImpact).toEqual({ score: 15 });
        expect(body.totalItems).toBe(7);
    });

    it("returns 404 for an unknown id", async () => {
        const request = new NextRequest("http://localhost/api/donations/%23does-not-exist");
        const response = await getDonation(request, {
            params: Promise.resolve({ id: "#does-not-exist" }),
        });
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body).toEqual({ error: "Donation not found" });
    });
    
    // ID starts with #, e.g. #D12, so need to encode it, then the backend should decode it
    it("resolves a percent-encoded id from the request URL", async () => {
        const request = new NextRequest("http://localhost/api/donations/%23TEST-A1");
        const id = decodeURIComponent(new URL(request.url).pathname.split("/").pop()!);
        expect(id).toBe("#TEST-A1");

        const response = await getDonation(request, { params: Promise.resolve({ id }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.receiver.organisation).toBe("Recipient A");
    });
});
