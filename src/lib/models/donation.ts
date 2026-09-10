import { DonationStatus } from "./donationStatus";
import { DonationEntry } from "./donationEntry";
import { User } from "./user";
import { EnvironmentalImpact } from "./environmentalImpact"

export class Donation {
    id: string;
    createdAt: string;
    completedAt: string | null;
    desc: string | null;
    status: DonationStatus;
    entries: DonationEntry[];
    recipient: User;
    environmentalImpact: EnvironmentalImpact | null;

    constructor(
        id: string,
        createdAt: string,
        completedAt: string | null,
        desc: string | null,
        status: DonationStatus,
        entries: DonationEntry[],
        recipient: User,
        environmentalImpact: EnvironmentalImpact | null
    ) {
        this.id = id;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
        this.desc = desc;
        this.status = status;
        this.entries = entries;
        this.recipient = recipient;
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
