import { describe, expect, it } from "vitest";
import type { DonationSummaryDTO } from "@/lib/dto/donationSummary.dto";
import { pickFeaturedDelivery } from "@/lib/featuredDelivery";

type OrderOverrides = Omit<Partial<DonationSummaryDTO>, "receiver"> & { receiver?: Partial<DonationSummaryDTO["receiver"]> };

function order(overrides: OrderOverrides): DonationSummaryDTO {
    const { receiver, ...rest } = overrides;
    return {
        id: "D1",
        dateCreated: "2026-07-01T00:00:00.000Z",
        dateCompleted: "2026-08-01T00:00:00.000Z",
        description: null,
        status: "COMPLETED",
        totalItems: 3,
        healthImpactScore: 3.5,
        weightDivertedKg: 10,
        co2eAvoidedKg: 50,
        ...rest,
        receiver: {
            id: "r1",
            organisation: "Some Wildlife Shelter",
            city: "Traralgon",
            state: "VIC",
            type: "wildlife_rescue",
            ...receiver,
        },
    };
}

describe("pickFeaturedDelivery", () => {
    it("picks the most recently completed order, not the most recently created", () => {
        const older = order({ id: "D1", dateCreated: "2026-08-05T00:00:00.000Z", dateCompleted: "2026-08-06T00:00:00.000Z" });
        const newer = order({ id: "D2", dateCreated: "2026-07-01T00:00:00.000Z", dateCompleted: "2026-08-09T00:00:00.000Z" });

        expect(pickFeaturedDelivery([older, newer])?.id).toBe("D2");
    });

    it("skips orders that would not make a story", () => {
        const skipped = [
            order({ id: "open", status: "OPEN", dateCompleted: null }),
            order({ id: "low", healthImpactScore: 2.9 }),
            order({ id: "unscored", healthImpactScore: null }),
            order({ id: "unknown", receiver: { type: "unknown" } }),
            order({ id: "internal", receiver: { type: "internal" } }),
            order({ id: "untyped", receiver: { type: null } }),
            order({ id: "nowhere", receiver: { city: null } }),
        ].map((o) => ({ ...o, dateCompleted: o.dateCompleted && "2026-09-01T00:00:00.000Z" }));
        const good = order({ id: "good" });

        expect(pickFeaturedDelivery([...skipped, good])?.id).toBe("good");
    });

    it("returns null when nothing qualifies", () => {
        expect(pickFeaturedDelivery([])).toBeNull();
        expect(pickFeaturedDelivery([order({ healthImpactScore: 1 })])).toBeNull();
    });
});
