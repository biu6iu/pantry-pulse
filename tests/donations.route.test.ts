import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { seedFixtures, clearFixtures } from "./fixtures/donation";
import { GET as getDonations } from "@/app/api/donations/route";
import { GET as getDonation } from "@/app/api/donations/[id]/route";

let fixtures: Awaited<ReturnType<typeof seedFixtures>>;

beforeEach(async () => {
    fixtures = await seedFixtures();
});

afterEach(async () => {
    await clearFixtures();
});

describe("GET /api/donations", () => {
    it("returns a summary DTO per donation", async () => {
        const request = new NextRequest("http://localhost/api/donations");
        const response = await getDonations(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toHaveLength(3);

        const donationA1 = body.find((d: { id: string }) => d.id === "#TEST-A1");
        expect(donationA1).toMatchObject({ totalItems: 7, healthImpactScore: 15 });
    });
});

describe("GET /api/donations query parameters", () => {
    it("filters by status, case-insensitively", async () => {
        const request = new NextRequest("http://localhost/api/donations?status=open");
        const response = await getDonations(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.map((d: { id: string }) => d.id)).toEqual(["#TEST-A2"]);
    });

    it("filters by recipientId", async () => {
        const request = new NextRequest(
            `http://localhost/api/donations?recipientId=${fixtures.recipientB.id}`,
        );
        const response = await getDonations(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.map((d: { id: string }) => d.id)).toEqual(["#TEST-B1"]);
    });

    it("filters by a from/to date range", async () => {
        const request = new NextRequest("http://localhost/api/donations?from=2026-07-01&to=2026-08-01");
        const response = await getDonations(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.map((d: { id: string }) => d.id)).toEqual(["#TEST-A2"]);
    });

    it("paginates with limit and offset", async () => {
        const request = new NextRequest("http://localhost/api/donations?limit=1&offset=1");
        const response = await getDonations(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.map((d: { id: string }) => d.id)).toEqual(["#TEST-A2"]);
    });

    it("combines status and recipientId filters together", async () => {
        const request = new NextRequest(
            `http://localhost/api/donations?status=completed&recipientId=${fixtures.recipientA.id}`,
        );
        const response = await getDonations(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.map((d: { id: string }) => d.id)).toEqual(["#TEST-A1"]);
    });

    it("returns an empty array, not an error, when filters match nothing", async () => {
        const request = new NextRequest("http://localhost/api/donations?status=open&recipientId=no-such-id");
        const response = await getDonations(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual([]);
    });
});

describe("GET /api/donations validation", () => {
    it.each([
        ["status", "bogus"],
        ["recipientId", ""],
        ["from", "not-a-date"],
        ["to", "also-not-a-date"],
        ["limit", "0"],
        ["limit", "-1"],
        ["limit", "1.5"],
        ["limit", "abc"],
        ["offset", "-1"],
        ["offset", "1.5"],
        ["offset", "abc"],
    ])("returns 400 with a clear message for %s=%s", async (param, value) => {
        const request = new NextRequest(
            `http://localhost/api/donations?${param}=${encodeURIComponent(value)}`,
        );
        const response = await getDonations(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(typeof body.error).toBe("string");
        expect(body.error.length).toBeGreaterThan(0);
    });

    it("rejects an invalid filter without letting it reach the database", async () => {
        const request = new NextRequest("http://localhost/api/donations?limit=not-a-number");
        const response = await getDonations(request);

        expect(response.status).toBe(400);
    });

    it("still applies valid filters alongside other, unrelated valid params", async () => {
        const request = new NextRequest("http://localhost/api/donations?status=OPEN&limit=10");
        const response = await getDonations(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.map((d: { id: string }) => d.id)).toEqual(["#TEST-A2"]);
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
