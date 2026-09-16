import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { seedFixtures, clearFixtures } from "./fixtures/donation";
import { GET as getTracking } from "@/app/api/tracking/[id]/route";
import { ORIGIN } from "@/lib/config/origin";

beforeEach(async () => {
    await seedFixtures();
});

afterEach(async () => {
    await clearFixtures();
});

describe("GET /api/tracking/[id]", () => {
    it("returns the status timeline and both endpoints of the route for a known id", async () => {
        const request = new NextRequest("http://localhost/api/tracking/%23TEST-A1");
        const response = await getTracking(request, {
            params: Promise.resolve({ id: "#TEST-A1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.status).toBe("COMPLETED");
        expect(body.origin).toEqual(ORIGIN);
        expect(body.receiver).toMatchObject({
            organisation: "Recipient A",
            lat: 41.4993,
            lng: -81.6944,
        });
        expect(body.timeline).toHaveLength(2);
    });

    it("returns null coordinates for a receiver that hasn't been geocoded", async () => {
        const request = new NextRequest("http://localhost/api/tracking/%23TEST-B1");
        const response = await getTracking(request, {
            params: Promise.resolve({ id: "#TEST-B1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.receiver).toMatchObject({ organisation: "Recipient B", lat: null, lng: null });
    });

    it("returns 404 for an unknown id", async () => {
        const request = new NextRequest("http://localhost/api/tracking/%23does-not-exist");
        const response = await getTracking(request, {
            params: Promise.resolve({ id: "#does-not-exist" }),
        });
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body).toEqual({ error: "Donation not found" });
    });

    // ID starts with #, e.g. #D12, so need to encode it, then the backend should decode it
    it("resolves a percent-encoded id from the request URL", async () => {
        const request = new NextRequest("http://localhost/api/tracking/%23TEST-A1");
        const id = decodeURIComponent(new URL(request.url).pathname.split("/").pop()!);
        expect(id).toBe("#TEST-A1");

        const response = await getTracking(request, { params: Promise.resolve({ id }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.receiver.organisation).toBe("Recipient A");
    });
});
