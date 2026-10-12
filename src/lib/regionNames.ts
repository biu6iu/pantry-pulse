// Some recipients store a region as an ISO 3166-2 code ("TH-83") rather than a name. This turns the codes we
// know into names for display; anything else is shown as stored. Add a line when an order goes somewhere new.
const REGION_NAMES: Record<string, string> = {
  // Thailand
  "TH-10": "Bangkok",
  "TH-50": "Chiang Mai",
  "TH-76": "Phetchaburi",
  "TH-77": "Prachuap Khiri Khan",
  "TH-83": "Phuket",
  // Indonesia
  "ID-BA": "Bali",
  "ID-JK": "Jakarta",
  "ID-NB": "West Nusa Tenggara",
};

/** "TH-83" -> "Phuket"; a value with no known name, such as "Hanoi", comes back unchanged. */
export function regionName(region: string | null | undefined): string {
  const value = (region ?? "").trim();
  return REGION_NAMES[value.toUpperCase()] ?? value;
}
