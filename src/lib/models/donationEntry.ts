import { DonatedItem } from "./donatedItem";
import { HealthImpact } from "./healthImpact";

export class DonationEntry {
    id: string;
    item: DonatedItem;
    quantity: number;
    healthImpact: HealthImpact | null;

    constructor(
        id: string,
        item: DonatedItem,
        quantity: number,
        healthImpact: HealthImpact | null,
    ) {
        this.id = id;
        this.item = item;
        this.quantity = quantity;
        this.healthImpact = healthImpact;
    }
}
