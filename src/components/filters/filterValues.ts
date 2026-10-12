import type { DonationFilters } from "@/lib/dto/donationFilters.dto";

// What the filter form holds: plain strings straight from the inputs, with "" meaning "not set"
export interface FilterValues {
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD"
  country: string; // the stored country code, e.g. "AU"
  state: string; // only used with Australia, which is the only country with a state list
  status: "" | "OPEN" | "COMPLETED";
}

export const EMPTY_FILTER_VALUES: FilterValues = { from: "", to: "", country: "", state: "", status: "" };

export const AUSTRALIA_COUNTRY_CODE = "AU";

export interface CountryOption {
  value: string; // the stored code sent to the API
  label: string; // the name shown to the visitor
}

// "ID" -> "Indonesia". Falls back to the stored value when it is not a standard country code
function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Builds the country choices from the countries in the data, so a country appears as soon as an order has been
 * sent there. Australia is listed first, then the rest alphabetically.
 */
export function countryOptionsFromCodes(codes: string[]): CountryOption[] {
  return [...new Set(codes.filter(Boolean))]
    .map((code) => ({ value: code, label: countryName(code) }))
    .sort((a, b) => {
      if (a.value === AUSTRALIA_COUNTRY_CODE) return -1;
      if (b.value === AUSTRALIA_COUNTRY_CODE) return 1;
      return a.label.localeCompare(b.label);
    });
}

// The states the API accepts when no country is given (see src/lib/api/filters.ts)
export const STATE_OPTIONS = [
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NSW", label: "New South Wales" },
  { value: "NT", label: "Northern Territory" },
  { value: "QLD", label: "Queensland" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "VIC", label: "Victoria" },
  { value: "WA", label: "Western Australia" },
];

export const STATUS_OPTIONS: { value: FilterValues["status"]; label: string }[] = [
  { value: "COMPLETED", label: "Completed" },
  { value: "OPEN", label: "Open" },
];

/** Returns a message for the visitor when the values cannot be searched, or null when they are fine. */
export function validateFilterValues(values: FilterValues): string | null {
  if (values.from && values.to && values.from > values.to) {
    return "The start date must be on or before the end date.";
  }
  return null;
}

export function countActiveFilters(values: FilterValues): number {
  return [values.from, values.to, values.country, values.state, values.status].filter(Boolean).length;
}

/**
 * Turns the form values into the filters the API wrappers take, leaving out anything not set.
 * Dates are sent as full timestamps, so the API's "a date-only `to` covers the whole day" rule
 * does not apply; `to` is moved to the end of its day here instead.
 */
export function toDonationFilters(values: FilterValues): DonationFilters {
  const filters: DonationFilters = {};

  if (values.from) filters.from = new Date(`${values.from}T00:00:00.000Z`);
  if (values.to) filters.to = new Date(`${values.to}T23:59:59.999Z`);
  if (values.country) filters.country = values.country;
  if (values.state) filters.state = values.state;
  if (values.status) filters.status = values.status;

  return filters;
}
