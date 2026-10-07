import type { DonationFilters } from "@/lib/repositories/donation.repository.interface";

export type ParsedFilters = { ok: true; filters: DonationFilters } | { ok: false; error: string };

const VALID_STATUSES = ["OPEN", "COMPLETED"];

// States are only checked against these when the country is absent or Australia, so an
// international recipient's state is never rejected
const AU_STATE_CODES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];
const AU_COUNTRY_NAMES = ["AU", "AUSTRALIA"];

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function fail(error: string): ParsedFilters {
  return { ok: false, error };
}

// Dates are compared against each donation's createdAt (the order date), the same field the list
// filter and the monthly chart use. A date-only "to" runs to the end of that day in UTC, so
// to=2025-12-31 includes orders placed at any time on 31 December
function parseDate(value: string, endOfDay: boolean): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay && DATE_ONLY.test(value)) date.setUTCHours(23, 59, 59, 999);
  return date;
}

// Shared by every route that takes filters, so they all validate in exactly the same way
export function parseDonationFilters(params: URLSearchParams): ParsedFilters {
  const filters: DonationFilters = {};

  const status = params.get("status");
  if (status !== null) {
    const normalised = status.toUpperCase();
    if (!VALID_STATUSES.includes(normalised)) {
      return fail(`Invalid status: ${status}`);
    }
    filters.status = normalised as "OPEN" | "COMPLETED";
  }

  const recipientId = params.get("recipientId");
  if (recipientId !== null) {
    if (recipientId.trim() === "") {
      return fail("recipientId must not be empty");
    }
    filters.recipientId = recipientId;
  }

  const from = params.get("from");
  if (from !== null) {
    const date = parseDate(from, false);
    if (date === null) {
      return fail(`Invalid from date: ${from}`);
    }
    filters.from = date;
  }

  const to = params.get("to");
  if (to !== null) {
    const date = parseDate(to, true);
    if (date === null) {
      return fail(`Invalid to date: ${to}`);
    }
    filters.to = date;
  }

  if (filters.from && filters.to && filters.from > filters.to) {
    return fail("from must not be after to");
  }

  const country = params.get("country");
  if (country !== null) {
    if (country.trim() === "") {
      return fail("country must not be empty");
    }
    filters.country = country.trim();
  }

  const state = params.get("state");
  if (state !== null) {
    if (state.trim() === "") {
      return fail("state must not be empty");
    }
    const isAustralian = !filters.country || AU_COUNTRY_NAMES.includes(filters.country.toUpperCase());
    if (isAustralian && !AU_STATE_CODES.includes(state.trim().toUpperCase())) {
      return fail(`Invalid state: ${state}`);
    }
    filters.state = state.trim();
  }

  const limit = params.get("limit");
  if (limit !== null) {
    const parsed = Number(limit);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return fail(`Invalid limit: ${limit}`);
    }
    filters.limit = parsed;
  }

  const offset = params.get("offset");
  if (offset !== null) {
    const parsed = Number(offset);
    if (!Number.isInteger(parsed) || parsed < 0) {
      return fail(`Invalid offset: ${offset}`);
    }
    filters.offset = parsed;
  }

  return { ok: true, filters };
}
