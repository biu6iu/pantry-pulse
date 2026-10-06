export interface EnvironmentalImpact {
    unitsDelivered: number;
    weightDivertedKg: number;
    co2eAvoidedKg: number;
}

// tiers run from 1 (highest health impact) to 4 (lowest)
export const HEALTH_IMPACT_TIER_COUNT = 4;

export function healthImpactScoreForTier(tier: number): number {
    return HEALTH_IMPACT_TIER_COUNT + 1 - tier;
}

// donations to Medical Pantry itself are not counted as impact
export const INTERNAL_RECIPIENT_TYPE = "internal";

export function roundImpact(value: number): number {
    return Number(value.toFixed(2));
}
