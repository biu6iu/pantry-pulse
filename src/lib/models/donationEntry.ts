export class DonationEntry {
    id: string;
    donatedItemId: string;
    quantity: number;
    itemName: string;
    itemCategory: string | null;
    healthImpactScore: number | null;

    constructor(
        id: string,
        donatedItemId: string,
        quantity: number,
        itemName: string,
        itemCategory: string | null,
        healthImpactScore: number | null,
    ) {
        this.id = id;
        this.donatedItemId = donatedItemId;
        this.quantity = quantity;
        this.itemName = itemName;
        this.itemCategory = itemCategory;
        this.healthImpactScore = healthImpactScore;
    }
}
