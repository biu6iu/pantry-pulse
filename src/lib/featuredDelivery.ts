import type { DonationSummaryDTO } from "@/lib/dto/donationSummary.dto";

// How each recipient type is described in the featured delivery story, with its article.
// Only these types can be featured: "unknown", "other" and "internal" do not make a story,
// and a type added to the data later is left out until it has a phrase here.
export const RECIPIENT_PHRASES: Record<string, string> = {
  wildlife_rescue: "a wildlife rescue",
  companion_animal_rescue: "an animal rescue",
  animal_welfare: "an animal welfare group",
  veterinary_clinic: "a vet clinic",
  human_health_service: "a health service",
  farm_animal_sanctuary: "a farm animal sanctuary",
};

// orders at or above this health impact score are the ones worth telling as a story (High on the tracker's scale)
export const FEATURED_MIN_HEALTH_SCORE = 3;

/**
 * The delivery to feature on the home page: the most recently completed order to a recipient type with a
 * phrase, with a known suburb and a high health impact score. Null when no order qualifies.
 */
export function pickFeaturedDelivery(orders: DonationSummaryDTO[]): DonationSummaryDTO | null {
  const candidates = orders.filter(
    (o) =>
      o.status === "COMPLETED" &&
      o.dateCompleted !== null &&
      o.receiver.type !== null &&
      o.receiver.type in RECIPIENT_PHRASES &&
      o.receiver.city !== null &&
      o.healthImpactScore !== null &&
      o.healthImpactScore >= FEATURED_MIN_HEALTH_SCORE,
  );

  // ISO timestamps sort correctly as strings
  return candidates.toSorted((a, b) => b.dateCompleted!.localeCompare(a.dateCompleted!))[0] ?? null;
}
