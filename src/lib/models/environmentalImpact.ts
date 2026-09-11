import { Impact } from "./impact";

export class EnvironmentalImpact extends Impact {
    donationId: string;
    co2Saved: number;

    constructor(id: string, value: number, donationId: string, co2Saved: number) {
        super(id, value);
        this.donationId = donationId;
        this.co2Saved = co2Saved;
    }
}