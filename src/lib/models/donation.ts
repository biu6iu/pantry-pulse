import { DonationStatus } from "./donationStatus";
import { DonationEntry } from "./donationEntry";

export class Donation {
    id: string;
    createdAt: string;
    completedAt: string | null;
    desc: string | null;
    status: DonationStatus;
    entries: DonationEntry[];
    recipientId: string;
    recipientOrganisation: string;
    environmentalImpact: { co2Saved: number; score: number } | null;

    constructor(
        id: string,
        createdAt: string,
        completedAt: string | null,
        desc: string | null,
        status: DonationStatus,
        entries: DonationEntry[],
        recipientId: string,
        recipientOrganisation: string,
        environmentalImpact: { co2Saved: number; score: number } | null,
    ) {
        this.id = id;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
        this.desc = desc;
        this.status = status;
        this.entries = entries;
        this.recipientId = recipientId;
        this.recipientOrganisation = recipientOrganisation;
        this.environmentalImpact = environmentalImpact;
    }

    getTotalItems(): number {
        return this.entries.reduce((sum, entry) => sum + entry.quantity, 0);
    }

    getTotalHealthImpactScore(): number | null {
        const scored = this.entries.filter((entry) => entry.healthImpactScore !== null);
        if (scored.length === 0) return null;
        return scored.reduce((sum, entry) => sum + (entry.healthImpactScore as number), 0);
    }
}
