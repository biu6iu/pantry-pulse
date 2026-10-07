import { healthImpactScoreForTier } from "./impact";

export const UNCATEGORISED = "Uncategorised";

export class DonatedItem {
    id: string;
    name: string; 
    category: string | null;
    sku: string | null; // stock keeping unit
    unitsPerPack: number | null;
    unitWeightKg: number | null;
    co2eKgPerUnit: number | null;
    healthImpactTier: number | null;

    constructor(
        id: string,
        name: string,
        category: string | null = null,
        sku: string | null = null,
        unitsPerPack: number | null = null,
        unitWeightKg: number | null = null,
        co2eKgPerUnit: number | null = null,
        healthImpactTier: number | null = null,
    ) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.sku = sku;
        this.unitsPerPack = unitsPerPack;
        this.unitWeightKg = unitWeightKg;
        this.co2eKgPerUnit = co2eKgPerUnit;
        this.healthImpactTier = healthImpactTier;
    }

    getHealthImpactScore(): number | null {
        return this.healthImpactTier === null ? null : healthImpactScoreForTier(this.healthImpactTier);
    }
}
