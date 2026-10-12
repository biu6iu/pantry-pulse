import { describe, expect, it } from "vitest";
import { parseDonationFilters } from "@/lib/api/filters";

function parse(query: string) {
    return parseDonationFilters(new URLSearchParams(query));
}

describe("parseDonationFilters", () => {
    it("returns no filters when there are no parameters", () => {
        expect(parse("")).toEqual({ ok: true, filters: {} });
    });

    it("parses every supported parameter", () => {
        const result = parse(
            "status=completed&recipientId=abc&from=2026-07-01&to=2026-08-01&country=AU&state=vic&limit=10&offset=5",
        );

        expect(result).toEqual({
            ok: true,
            filters: {
                status: "COMPLETED",
                recipientId: "abc",
                from: new Date("2026-07-01T00:00:00.000Z"),
                to: new Date("2026-08-01T23:59:59.999Z"),
                country: "AU",
                state: "vic",
                limit: 10,
                offset: 5,
            },
        });
    });

    describe("dates", () => {
        it("runs a date-only 'to' to the end of that day", () => {
            const result = parse("to=2025-12-31");

            expect(result).toMatchObject({ ok: true, filters: { to: new Date("2025-12-31T23:59:59.999Z") } });
        });

        it("keeps the exact time when 'to' includes one", () => {
            const result = parse("to=2025-12-31T15:00:00Z");

            expect(result).toMatchObject({ ok: true, filters: { to: new Date("2025-12-31T15:00:00Z") } });
        });

        it("starts a date-only 'from' at the beginning of that day", () => {
            const result = parse("from=2025-01-01");

            expect(result).toMatchObject({ ok: true, filters: { from: new Date("2025-01-01T00:00:00.000Z") } });
        });

        it("accepts from and to on the same day", () => {
            expect(parse("from=2025-06-01&to=2025-06-01")).toMatchObject({ ok: true });
        });

        it("rejects a from that is after the to", () => {
            expect(parse("from=2026-08-01&to=2026-07-01")).toEqual({
                ok: false,
                error: "from must not be after to",
            });
        });
    });

    describe("state", () => {
        it("accepts Australian state codes in any case", () => {
            expect(parse("state=VIC")).toMatchObject({ ok: true });
            expect(parse("state=nsw")).toMatchObject({ ok: true });
        });

        it("rejects an unknown state code", () => {
            expect(parse("state=XYZ")).toEqual({ ok: false, error: "Invalid state: XYZ" });
        });

        it("checks the state against Australian codes when the country is Australia", () => {
            expect(parse("country=Australia&state=VIC")).toMatchObject({ ok: true });
            expect(parse("country=AU&state=OH")).toEqual({ ok: false, error: "Invalid state: OH" });
        });

        it("does not check the state for another country", () => {
            expect(parse("country=US&state=OH")).toMatchObject({
                ok: true,
                filters: { country: "US", state: "OH" },
            });
        });
    });

    it.each([
        ["status=bogus", "Invalid status: bogus"],
        ["recipientId=", "recipientId must not be empty"],
        ["from=not-a-date", "Invalid from date: not-a-date"],
        ["to=also-not-a-date", "Invalid to date: also-not-a-date"],
        ["country=", "country must not be empty"],
        ["state=", "state must not be empty"],
        ["limit=0", "Invalid limit: 0"],
        ["limit=1.5", "Invalid limit: 1.5"],
        ["limit=abc", "Invalid limit: abc"],
        ["offset=-1", "Invalid offset: -1"],
        ["offset=abc", "Invalid offset: abc"],
    ])("rejects %s", (query, error) => {
        expect(parse(query)).toEqual({ ok: false, error });
    });
});
