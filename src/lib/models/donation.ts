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

    constructor(id: string, createdAt: string, completedAt: string | null, desc: string | null, status: DonationStatus, entries: DonationEntry[], recipientId: string) {
        this.id = id;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
        this.desc = desc;
        this.status = status;
        this.entries = entries;
        this.recipientId = recipientId;
    }

    getTotalItems(): number {
        return this.entries.reduce((sum, entry) => sum + entry.quantity, 0);
    }
}