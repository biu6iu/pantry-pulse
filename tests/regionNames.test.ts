import { describe, expect, it } from "vitest";
import { regionName } from "@/lib/regionNames";

describe("regionName", () => {
    it("turns a known code into its name, whatever its case", () => {
        expect(regionName("TH-83")).toBe("Phuket");
        expect(regionName("id-nb")).toBe("West Nusa Tenggara");
    });

    it("leaves anything it doesn't know as stored", () => {
        expect(regionName("Hanoi")).toBe("Hanoi");
        expect(regionName("VIC")).toBe("VIC");
        expect(regionName("TH-99")).toBe("TH-99");
    });

    it("returns an empty string for a missing region", () => {
        expect(regionName(null)).toBe("");
        expect(regionName(undefined)).toBe("");
    });
});
