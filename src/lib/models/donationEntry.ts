export class DonationEntry {
    id: string;
    donatedItemId: string;
    quantity: number;

    constructor(id: string, donatedItemId: string, quantity: number) {
        this.id = id;
        this.donatedItemId = donatedItemId;
        this.quantity = quantity;
    }
}