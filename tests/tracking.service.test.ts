import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { seedFixtures, clearFixtures } from "./fixtures/donation";
import { DonationRepository } from "@/lib/repositories/donation.repository";
import { TrackingService } from "@/lib/services/tracking.service";
import { ORIGIN } from "@/lib/config/origin";

const service = new TrackingService(new DonationRepository());

beforeEach(async () => {
    await seedFixtures();
});

afterEach(async () => {
    await clearFixtures();
});

describe("getTracking", () => {
    it("marks both stages complete for a completed donation and includes the receiver's coordinates", async () => {
        const tracking = await service.getTracking("#TEST-A1");

        expect(tracking?.status).toBe("COMPLETED");
        expect(tracking?.origin).toEqual(ORIGIN);
        expect(tracking?.receiver).toMatchObject({
            organisation: "Recipient A",
            city: "Cleveland",
            country: "US",
            lat: 41.4993,
            lng: -81.6944,
        });
        expect(tracking?.timeline).toEqual([
            { stage: "CREATED", label: "Created", occurredAt: "2026-08-29T00:00:00.000Z", complete: true },
            { stage: "COMPLETED", label: "Completed", occurredAt: null, complete: true },
        ]);
    });

    it("leaves the completed stage incomplete for an open donation", async () => {
        const tracking = await service.getTracking("#TEST-A2");

        expect(tracking?.status).toBe("OPEN");
        expect(tracking?.timeline).toEqual([
            { stage: "CREATED", label: "Created", occurredAt: "2026-07-29T00:00:00.000Z", complete: true },
            { stage: "COMPLETED", label: "Completed", occurredAt: null, complete: false },
        ]);
    });

    it("takes the completed stage's date from completedAt when it's set", async () => {
        const tracking = await service.getTracking("#TEST-B1");

        expect(tracking?.timeline).toEqual([
            { stage: "CREATED", label: "Created", occurredAt: "2026-06-29T00:00:00.000Z", complete: true },
            { stage: "COMPLETED", label: "Completed", occurredAt: "2026-07-03T00:00:00.000Z", complete: true },
        ]);
    });

    it("passes through null coordinates for a receiver that hasn't been geocoded", async () => {
        const tracking = await service.getTracking("#TEST-B1");

        expect(tracking?.receiver).toMatchObject({
            organisation: "Recipient B",
            city: "Shanghai",
            lat: null,
            lng: null,
        });
    });

    it("returns null for an unknown id", async () => {
        const tracking = await service.getTracking("#does-not-exist");

        expect(tracking).toBeNull();
    });
});
