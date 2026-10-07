import type { DonationFilters } from "@/lib/dto/donationFilters.dto";

// Serialises filters into a query string (including the leading "?"), leaving out any that are not set
export function toQueryString(filters: DonationFilters = {}): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, value instanceof Date ? value.toISOString() : String(value));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
