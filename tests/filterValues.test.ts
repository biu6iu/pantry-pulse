import { describe, expect, it } from "vitest";
import {
    EMPTY_FILTER_VALUES,
    countActiveFilters,
    countryOptionsFromCodes,
    displayToIsoDate,
    isoToDisplayDate,
    regionOptionsForCountry,
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
        expect(
            toDonationFilters({ ...EMPTY_FILTER_VALUES, country: "AU", state: "VIC", status: "COMPLETED" }),
        ).toEqual({
            country: "AU",
            state: "VIC",
            status: "COMPLETED",
        });
    });

    it("filters by an international country on its own", () => {
        expect(toDonationFilters({ ...EMPTY_FILTER_VALUES, country: "ID" })).toEqual({ country: "ID" });
    });

    it("starts the range at the start of the from day and ends it at the end of the to day", () => {
        const filters = toDonationFilters({ ...EMPTY_FILTER_VALUES, from: "2026-08-01", to: "2026-08-31" });

        expect(filters.from?.toISOString()).toBe("2026-08-01T00:00:00.000Z");
        expect(filters.to?.toISOString()).toBe("2026-08-31T23:59:59.999Z");
    });

    it("produces a query string the API's filter parser accepts unchanged", () => {
        const filters = toDonationFilters({
            from: "2026-08-01",
            to: "2026-08-31",
            country: "AU",
            state: "VIC",
            status: "OPEN",
        });
        const parsed = parseDonationFilters(new URLSearchParams(toQueryString(filters)));

        expect(parsed).toEqual({ ok: true, filters });
    });

    it("produces an international filter the API accepts, with no state to confuse it", () => {
        const filters = toDonationFilters({ ...EMPTY_FILTER_VALUES, country: "ID" });
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
        expect(countActiveFilters({ from: "2026-08-01", to: "", country: "AU", state: "VIC", status: "" })).toBe(3);
    });
});

describe("regionOptionsForCountry", () => {
    const regions = { AU: ["NSW", "VIC"], TH: ["TH-76", "TH-83"], VN: ["Hanoi"] };

    it("has no choices until a country is picked", () => {
        expect(regionOptionsForCountry("", regions)).toEqual([]);
    });

    it("shows full names for Australian states", () => {
        expect(regionOptionsForCountry("AU", regions)).toEqual([
            { value: "NSW", label: "New South Wales" },
            { value: "VIC", label: "Victoria" },
        ]);
    });

    it("lists another country's own regions, including a city where there is no state", () => {
        expect(regionOptionsForCountry("TH", regions)).toEqual([
            { value: "TH-76", label: "Phetchaburi" },
            { value: "TH-83", label: "Phuket" },
        ]);
        expect(regionOptionsForCountry("VN", regions)).toEqual([{ value: "Hanoi", label: "Hanoi" }]);
    });

    it("has no choices for a country with none on record", () => {
        expect(regionOptionsForCountry("FJ", regions)).toEqual([]);
    });
});

describe("countryOptionsFromCodes", () => {
    it("lists each country once, with Australia first and the rest alphabetically by name", () => {
        const options = countryOptionsFromCodes(["VN", "AU", "ID", "AU", "FJ"]);

        expect(options).toEqual([
            { value: "AU", label: "Australia" },
            { value: "FJ", label: "Fiji" },
            { value: "ID", label: "Indonesia" },
            { value: "VN", label: "Vietnam" },
        ]);
    });

    it("leaves out blank values", () => {
        expect(countryOptionsFromCodes(["", "TH"])).toEqual([{ value: "TH", label: "Thailand" }]);
    });

    it("falls back to the stored value when it is not a standard country code", () => {
        expect(countryOptionsFromCodes(["Atlantis"])).toEqual([{ value: "Atlantis", label: "Atlantis" }]);
    });
});

describe("isoToDisplayDate", () => {
    it("shows the day first", () => {
        expect(isoToDisplayDate("2026-08-29")).toBe("29/08/2026");
    });

    it("shows nothing for an unset date", () => {
        expect(isoToDisplayDate("")).toBe("");
    });
});

describe("displayToIsoDate", () => {
    it("reads the day first", () => {
        expect(displayToIsoDate("03/08/2026")).toBe("2026-08-03");
    });

    it("accepts one-digit days and months and other separators", () => {
        expect(displayToIsoDate("3/8/2026")).toBe("2026-08-03");
        expect(displayToIsoDate("03-08-2026")).toBe("2026-08-03");
        expect(displayToIsoDate("03.08.2026")).toBe("2026-08-03");
    });

    it("round-trips with isoToDisplayDate", () => {
        expect(displayToIsoDate(isoToDisplayDate("2026-12-31"))).toBe("2026-12-31");
    });

    it.each(["31/02/2026", "29/02/2025", "13/13/2026", "00/01/2026", "03/08/26", "2026-08-03", "half typed", ""])(
        "rejects %j",
        (input) => {
            expect(displayToIsoDate(input)).toBeNull();
        },
    );
});
