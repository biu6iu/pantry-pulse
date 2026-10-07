import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getImpactReport, listDonations } from "@/lib/api/client";
import { toQueryString } from "@/lib/api/query";

describe("toQueryString", () => {
    it("returns an empty string when no filters are given", () => {
        expect(toQueryString()).toBe("");
        expect(toQueryString({})).toBe("");
    });

    it("leaves out filters that are not set", () => {
        expect(toQueryString({ status: "OPEN", country: undefined, state: "" })).toBe("?status=OPEN");
    });

    it("serialises every filter, with dates as ISO strings", () => {
        const query = toQueryString({
            status: "COMPLETED",
            recipientId: "abc",
            from: new Date("2026-07-01T00:00:00Z"),
            to: new Date("2026-08-01T00:00:00Z"),
            country: "AU",
            state: "VIC",
            limit: 10,
            offset: 0,
        });

        expect(Object.fromEntries(new URLSearchParams(query))).toEqual({
            status: "COMPLETED",
            recipientId: "abc",
            from: "2026-07-01T00:00:00.000Z",
            to: "2026-08-01T00:00:00.000Z",
            country: "AU",
            state: "VIC",
            limit: "10",
            offset: "0",
        });
    });

    it("encodes values that are not URL-safe", () => {
        expect(toQueryString({ state: "New South Wales" })).toBe("?state=New+South+Wales");
    });
});

describe("API client wrappers", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        fetchMock.mockResolvedValue(Response.json({}));
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        fetchMock.mockReset();
    });

    it("listDonations sends no query string without filters", async () => {
        await listDonations();

        expect(fetchMock).toHaveBeenCalledWith("/api/donations", undefined);
    });

    it("listDonations forwards its filters", async () => {
        await listDonations({ status: "OPEN", limit: 5, offset: 10 });

        expect(fetchMock).toHaveBeenCalledWith("/api/donations?status=OPEN&limit=5&offset=10", undefined);
    });

    it("getImpactReport sends no query string without filters", async () => {
        await getImpactReport();

        expect(fetchMock).toHaveBeenCalledWith("/api/impact", undefined);
    });

    it("getImpactReport forwards its filters", async () => {
        await getImpactReport({ country: "AU", from: new Date("2026-07-01T00:00:00Z") });

        expect(fetchMock).toHaveBeenCalledWith(
            "/api/impact?country=AU&from=2026-07-01T00%3A00%3A00.000Z",
            undefined,
        );
    });
});
