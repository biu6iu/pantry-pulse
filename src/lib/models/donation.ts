import { DonationStatus } from "./donationStatus";
import { DonationEntry } from "./donationEntry";

export class Donation {
    id: string;
    dateDonated: string;
    desc: string;
    status: DonationStatus;
    entries: DonationEntry[];
    senderId: string;
    receiverId: string;

    constructor(id: string, dateDonated: string, desc: string, status: DonationStatus, entries: DonationEntry[], senderId: string, receiverId: string) {
        this.id = id;
        this.dateDonated = dateDonated;
        this.desc = desc;
        this.status = status;
        this.entries = entries;
        this.senderId = senderId;
        this.receiverId = receiverId;
    }

    getTotalItems(): number {
        return this.entries.reduce((sum, entry) => sum + entry.quantity, 0);
    }

}

