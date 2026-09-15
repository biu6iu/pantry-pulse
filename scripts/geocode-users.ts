import "dotenv/config";
import { prisma } from "../src/lib/config/db";

const LOCATION_IQ_KEY = process.env.LOCATION_IQ_KEY;
const REQUEST_DELAY_MS = 600;

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

async function geocode(query: string): Promise<GeocodeResult | null> {
  const url = new URL("https://us1.locationiq.com/v1/search");
  url.searchParams.set("key", LOCATION_IQ_KEY!);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const response = await fetch(url);
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

async function lookupCached(query: string, cache: Map<string, GeocodeResult | null>): Promise<GeocodeResult | null> {
  const key = normaliseQuery(query);
  if (cache.has(key)) return cache.get(key)!;

  const result = await geocode(query);
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

    const result = await lookupCached(fullQuery, cache);

    if (result === null) continue;


    await prisma.user.update({
      where: { id: user.id },
      data: { lat: result.lat, lng: result.lng },
    });
  }
}

main().finally(() => prisma.$disconnect());
