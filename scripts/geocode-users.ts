import "dotenv/config";
import { prisma } from "../src/lib/config/db";

const LOCATION_IQ_KEY = process.env.LOCATION_IQ_KEY;
// LocationIQ's free tier allows 60 requests per minute
const REQUEST_DELAY_MS = 1100;
// The limit is per minute, so a rate-limited request waits out the whole window before retrying
const RATE_LIMIT_RETRIES = 5;
const RATE_LIMIT_BACKOFF_MS = 65_000;

interface GeocodeResult {
  lat: number;
  lng: number;
}

interface UserAddress {
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildAddressQuery(user: UserAddress): string | null {
  const parts = [user.street, user.city, user.state, user.zip, user.country].filter(
    (part): part is string => Boolean(part && part.trim()),
  );
  return parts.length > 0 ? parts.join(", ") : null;
}

function normaliseQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

// Only 2-letter ISO codes (e.g. "AU") can be used to restrict results to a country
function toCountryCode(country: string | null): string | null {
  const trimmed = country?.trim() ?? "";
  return /^[A-Za-z]{2}$/.test(trimmed) ? trimmed.toLowerCase() : null;
}

async function geocode(query: string, countryCode: string | null): Promise<GeocodeResult | null> {
  const url = new URL("https://us1.locationiq.com/v1/search");
  url.searchParams.set("key", LOCATION_IQ_KEY!);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  // without this a free-text match can land in the wrong country
  if (countryCode) url.searchParams.set("countrycodes", countryCode);

  let response = await fetch(url);
  for (let attempt = 1; response.status === 429 && attempt <= RATE_LIMIT_RETRIES; attempt++) {
    console.log(`Rate limited, waiting ${RATE_LIMIT_BACKOFF_MS / 1000}s (retry ${attempt}/${RATE_LIMIT_RETRIES})...`);
    await sleep(RATE_LIMIT_BACKOFF_MS);
    response = await fetch(url);
  }
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`LocationIQ request failed (${response.status}): ${await response.text()}`);
  }

  const results = (await response.json()) as { lat: string; lon: string }[];
  const first = results[0];
  if (!first) return null;

  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
}

async function lookupCached(
  query: string,
  countryCode: string | null,
  cache: Map<string, GeocodeResult | null>,
): Promise<GeocodeResult | null> {
  const key = normaliseQuery(`${countryCode ?? ""}|${query}`);
  if (cache.has(key)) return cache.get(key)!;

  const result = await geocode(query, countryCode);
  cache.set(key, result);
  await sleep(REQUEST_DELAY_MS);
  return result;
}

async function main() {
  if (!LOCATION_IQ_KEY) {
    throw new Error("Missing LocationIQ API key in the environment.");
  }

  const users = await prisma.user.findMany({
    where: { OR: [{ lat: null }, { lng: null }] },
  });

  // cache by normalised address string
  const cache = new Map<string, GeocodeResult | null>();

  for (const user of users) {
    const fullQuery = buildAddressQuery(user);
    if (!fullQuery) continue;

    const countryCode = toCountryCode(user.country);
    let result = await lookupCached(fullQuery, countryCode, cache);

    // Subdivision codes like "TH-83" can make an otherwise valid address unmatchable, so retry without the state
    if (result === null && countryCode && user.state) {
      const fallbackQuery = buildAddressQuery({ ...user, state: null, country: null });
      if (fallbackQuery) result = await lookupCached(fallbackQuery, countryCode, cache);
    }

    if (result === null) {
      console.log(`Not found: ${user.name} (${fullQuery})`);
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lat: result.lat, lng: result.lng },
    });
    console.log(`Geocoded: ${user.name}`);
  }
}

main().finally(() => prisma.$disconnect());
