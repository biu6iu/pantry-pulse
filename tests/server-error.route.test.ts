import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DonationRepository } from "@/lib/repositories/donation.repository";
import { GET as getDonations } from "@/app/api/donations/route";
import { GET as getDonation } from "@/app/api/donations/[id]/route";
import { GET as getTracking } from "@/app/api/tracking/[id]/route";
import { GET as getImpact } from "@/app/api/impact/route";

afterEach(() => {
    vi.restoreAllMocks();
});

describe("GET /api/donations when the repository fails", () => {
    it("returns a 500 via serverError and logs the error", async () => {
        const error = new Error("database unavailable");
        vi.spyOn(DonationRepository.prototype, "getAll").mockRejectedValue(error);
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        const request = new NextRequest("http://localhost/api/donations");
        const response = await getDonations(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: "Internal server error" });
        expect(consoleError).toHaveBeenCalledWith(error);
    });
});

describe("GET /api/donations/[id] when the repository fails", () => {
    it("returns a 500 via serverError and logs the error", async () => {
        const error = new Error("database unavailable");
        vi.spyOn(DonationRepository.prototype, "getById").mockRejectedValue(error);
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        const request = new NextRequest("http://localhost/api/donations/%23TEST-A1");
        const response = await getDonation(request, { params: Promise.resolve({ id: "#TEST-A1" }) });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: "Internal server error" });
        expect(consoleError).toHaveBeenCalledWith(error);
    });
});

describe("GET /api/tracking/[id] when the repository fails", () => {
    it("returns a 500 via serverError and logs the error", async () => {
        const error = new Error("database unavailable");
        vi.spyOn(DonationRepository.prototype, "getById").mockRejectedValue(error);
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        const request = new NextRequest("http://localhost/api/tracking/%23TEST-A1");
        const response = await getTracking(request, { params: Promise.resolve({ id: "#TEST-A1" }) });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: "Internal server error" });
        expect(consoleError).toHaveBeenCalledWith(error);
    });
});

describe("GET /api/impact when the repository fails", () => {
    it("returns a 500 via serverError and logs the error", async () => {
        const error = new Error("database unavailable");
        vi.spyOn(DonationRepository.prototype, "getOverallImpactSummary").mockRejectedValue(error);
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

        const response = await getImpact(new NextRequest("http://localhost/api/impact"));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: "Internal server error" });
        expect(consoleError).toHaveBeenCalledWith(error);
    });
});