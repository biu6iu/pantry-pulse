import { Impact } from "./impact";

export class EnvironmentalImpact extends Impact {
    donationId: string;

    constructor(id: string, value: number, donationId: string) {
        super(id, value);
        this.donationId = donationId;
    }
}