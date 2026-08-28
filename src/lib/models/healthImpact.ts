import { Impact } from "./impact"

export class HealthImpact extends Impact {
    donationEntryId: string;

    constructor(id: string, value: number, donationEntryId: string) {
        super(id, value);
        this.donationEntryId = donationEntryId;
    }
}