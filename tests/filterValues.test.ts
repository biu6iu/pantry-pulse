import { describe, expect, it } from "vitest";
import {
    EMPTY_FILTER_VALUES,
    countActiveFilters,
    toDonationFilters,
    validateFilterValues,
} from "@/components/filters/filterValues";
import { parseDonationFilters } from "@/lib/api/filters";
import { toQueryString } from "@/lib/api/query";

describe("toDonationFilters", () => {
    it("returns no filters for an empty form", () => {
        expect(toDonationFilters(EMPTY_FILTER_VALUES)).toEqual({});
    });

    it("keeps only the values that are set", () => {
        expect(toDonationFilters({ ...EMPTY_FILTER_VALUES, state: "VIC", status: "COMPLETED" })).toEqual({
            state: "VIC",
            status: "COMPLETED",
        });
    });

    it("starts the range at the start of the from day and ends it at the end of the to day", () => {
        const filters = toDonationFilters({ ...EMPTY_FILTER_VALUES, from: "2026-08-01", to: "2026-08-31" });

        expect(filters.from?.toISOString()).toBe("2026-08-01T00:00:00.000Z");
        expect(filters.to?.toISOString()).toBe("2026-08-31T23:59:59.999Z");
    });

    it("produces a query string the API's filter parser accepts unchanged", () => {
        const filters = toDonationFilters({ from: "2026-08-01", to: "2026-08-31", state: "VIC", status: "OPEN" });
        const parsed = parseDonationFilters(new URLSearchParams(toQueryString(filters)));

        expect(parsed).toEqual({ ok: true, filters });
    });
});

describe("validateFilterValues", () => {
    it("accepts an empty form and a range in order", () => {
        expect(validateFilterValues(EMPTY_FILTER_VALUES)).toBeNull();
        expect(validateFilterValues({ ...EMPTY_FILTER_VALUES, from: "2026-08-01", to: "2026-08-01" })).toBeNull();
    });

    it("rejects a start date after the end date", () => {
        expect(validateFilterValues({ ...EMPTY_FILTER_VALUES, from: "2026-09-01", to: "2026-08-01" })).toBe(
            "The start date must be on or before the end date.",
        );
    });
});

describe("countActiveFilters", () => {
    it("counts the values that are set", () => {
        expect(countActiveFilters(EMPTY_FILTER_VALUES)).toBe(0);
        expect(countActiveFilters({ from: "2026-08-01", to: "", state: "VIC", status: "" })).toBe(2);
    });
});
