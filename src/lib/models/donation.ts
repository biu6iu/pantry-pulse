import { DonationStatus } from "./donationStatus";
import { DonationEntry } from "./donationEntry";
import { User } from "./user";
import { EnvironmentalImpact, INTERNAL_RECIPIENT_TYPE } from "./impact";

export class Donation {
    id: string;
    createdAt: string;
    completedAt: string | null;
    desc: string | null;
    status: DonationStatus;
    entries: DonationEntry[];
    recipient: User;

    constructor(
        id: string,
        createdAt: string,
        completedAt: string | null,
        desc: string | null,
        status: DonationStatus,
        entries: DonationEntry[],
        recipient: User,
    ) {
        this.id = id;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
        this.desc = desc;
        this.status = status;
        this.entries = entries;
        this.recipient = recipient;
    }

    getTotalItems(): number {
        return this.entries.reduce((sum, entry) => sum + entry.quantity, 0);
    }

    // only completed donations to external recipients count towards impact figures
    countsTowardImpact(): boolean {
        return this.status === "COMPLETED" && this.recipient.type !== INTERNAL_RECIPIENT_TYPE;
    }

    // average of the item scores, weighted by quantity
    getHealthImpactScore(): number | null {
        if (!this.countsTowardImpact()) return null;

        let weightedScore = 0;
        let scoredQuantity = 0;
        for (const entry of this.entries) {
            const score = entry.item.getHealthImpactScore();
            if (score === null) continue;
            weightedScore += entry.quantity * score;
            scoredQuantity += entry.quantity;
        }
        return scoredQuantity === 0 ? null : weightedScore / scoredQuantity;
    }

    getEnvironmentalImpact(): EnvironmentalImpact | null {
        if (!this.countsTowardImpact()) return null;
        if (this.entries.every((entry) => entry.getUnitsDelivered() === null)) return null;

        return {
            unitsDelivered: this.entries.reduce((sum, entry) => sum + (entry.getUnitsDelivered() ?? 0), 0),
            weightDivertedKg: this.entries.reduce((sum, entry) => sum + (entry.getWeightDivertedKg() ?? 0), 0),
            co2eAvoidedKg: this.entries.reduce((sum, entry) => sum + (entry.getCO2eAvoidedKg() ?? 0), 0),
        };
    }
}
