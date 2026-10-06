import { DonatedItem } from "./donatedItem";

export class DonationEntry {
    id: string;
    item: DonatedItem;
    quantity: number;

    constructor(
        id: string,
        item: DonatedItem,
        quantity: number,
    ) {
        this.id = id;
        this.item = item;
        this.quantity = quantity;
    }

    getUnitsDelivered(): number | null {
        return this.item.unitsPerPack === null ? null : this.quantity * this.item.unitsPerPack;
    }

    getWeightDivertedKg(): number | null {
        const units = this.getUnitsDelivered();
        return units === null || this.item.unitWeightKg === null ? null : units * this.item.unitWeightKg;
    }

    getCO2eAvoidedKg(): number | null {
        const units = this.getUnitsDelivered();
        return units === null || this.item.co2eKgPerUnit === null ? null : units * this.item.co2eKgPerUnit;
    }
}
