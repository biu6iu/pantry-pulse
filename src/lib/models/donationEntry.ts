export class DonationEntry {
    donatedItemId: string;
    quantity: number;

    constructor(donatedItemId: string, quantity: number) {
        this.donatedItemId = donatedItemId;
        this.quantity = quantity;
    }
}