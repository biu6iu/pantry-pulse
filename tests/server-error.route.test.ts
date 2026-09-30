import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DonationRepository } from "@/lib/repositories/donation.repository";
import { GET as getDonations } from "@/app/api/donations/route";

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