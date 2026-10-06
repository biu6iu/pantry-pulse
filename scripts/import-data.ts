// Run manually with: npx tsx scripts/import-data.ts [path-to-data-dir]
// The data dir (default: ./data) must contain items.csv, orders.csv and order_items.csv

import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "csv-parse/sync";
import { prisma } from "../src/lib/config/db";
import type { Prisma } from "../src/generated/prisma/client";

interface ItemRow {
  item_key: string;
  display_name: string;
  category: string;
  units_per_pack: string;
  unit_weight_kg: string;
  weight_source: string;
  co2e_kg_per_unit: string;
  co2e_source: string;
  health_impact_tier: string;
}

interface OrderRow {
  order_id: string;
  shopify_order_id: string;
  status: string;
  created_at: string;
  completed_at: string;
  delivery_method: string;
  recipient_org: string;
  recipient_type: string;
  suburb: string;
  postcode: string;
  state: string;
  country: string;
}

interface OrderItemRow {
  order_id: string;
  line_no: string;
  item_key: string;
  variant: string;
  quantity: string;
}

const UNKNOWN_ORG = "Unknown organisation";

// cleaning helpers

/** Trims a value and turns an empty string into null. */
function cleanText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

// Normalises casing/whitespace only
function cleanStatus(value: string | undefined): string {
  return value?.trim().toLowerCase() || "unknown";
}

function cleanQuantity(value: string | undefined): number {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function cleanInt(value: string | undefined): number | null {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) ? n : null;
}

function cleanFloat(value: string | undefined): number | null {
  const n = parseFloat(value ?? "");
  return Number.isFinite(n) ? n : null;
}

function parseCsvDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function readCsv<T>(dir: string, file: string): T[] {
  return parse(readFileSync(join(dir, file), "utf8"), { columns: true, skip_empty_lines: true });
}

// Orders with no organisation name share a placeholder recipient per distinct type + location.
async function findOrCreateRecipient(
  db: Prisma.TransactionClient,
  order: OrderRow,
  warnings: string[],
): Promise<string> {
  const orgName = cleanText(order.recipient_org);
  const details = {
    type: cleanText(order.recipient_type),
    city: cleanText(order.suburb),
    zip: cleanText(order.postcode),
    state: cleanText(order.state),
    country: cleanText(order.country),
  };

  if (!orgName) {
    warnings.push(`${order.order_id}: no recipient_org, used "${UNKNOWN_ORG}" as the recipient name instead`);
  }

  const existing = await db.user.findFirst({
    where: orgName ? { name: orgName } : { name: UNKNOWN_ORG, ...details },
  });
  if (!existing) {
    const created = await db.user.create({ data: { name: orgName ?? UNKNOWN_ORG, ...details } });
    return created.id;
  }

  if (existing.city !== details.city || existing.zip !== details.zip) {
    warnings.push(
      `${order.order_id}: "${existing.name}" already exists at ${existing.city ?? "?"} ${existing.zip ?? "?"}, ` +
        `ignored location ${details.city ?? "?"} ${details.zip ?? "?"}`,
    );
  }
  return existing.id;
}

async function main() {
  const dataDir = process.argv[2] ?? "data";

  const items = readCsv<ItemRow>(dataDir, "items.csv");
  const orders = readCsv<OrderRow>(dataDir, "orders.csv");
  const orderItems = readCsv<OrderItemRow>(dataDir, "order_items.csv");

  let itemCount = 0;
  let donationCount = 0;
  let entryCount = 0;
  const warnings: string[] = [];

  // Upserts throughout (keyed on ids taken from the source data) so re-running the script is safe

  const itemIds = new Set<string>();
  for (const row of items) {
    const id = cleanText(row.item_key);
    if (!id) continue;

    const data = {
      name: cleanText(row.display_name) ?? id,
      category: cleanText(row.category),
      unitsPerPack: cleanInt(row.units_per_pack),
      unitWeightKg: cleanFloat(row.unit_weight_kg),
      weightSource: cleanText(row.weight_source),
      co2eKgPerUnit: cleanFloat(row.co2e_kg_per_unit),
      co2eSource: cleanText(row.co2e_source),
      healthImpactTier: cleanInt(row.health_impact_tier),
    };
    await prisma.donatedItem.upsert({ where: { id }, update: data, create: { id, ...data } });
    itemIds.add(id);
    itemCount++;
  }

  const donationIds = new Set<string>();
  for (const row of orders) {
    const id = cleanText(row.order_id);
    if (!id) continue;

    const createdAt = parseCsvDate(row.created_at);
    if (!createdAt) {
      warnings.push(`${id}: no valid created_at date, skipped entirely`);
      continue;
    }

    const data = {
      status: cleanStatus(row.status),
      createdAt,
      completedAt: parseCsvDate(row.completed_at),
      shopifyOrderId: cleanText(row.shopify_order_id),
      deliveryMethod: cleanText(row.delivery_method),
      recipientId: await findOrCreateRecipient(prisma, row, warnings),
    };
    await prisma.donation.upsert({ where: { id }, update: data, create: { id, ...data } });
    donationIds.add(id);
    donationCount++;
  }

  for (const row of orderItems) {
    const donationId = cleanText(row.order_id);
    const itemId = cleanText(row.item_key);
    const lineNo = cleanInt(row.line_no);
    const label = `${donationId ?? "?"} line ${row.line_no || "?"}`;

    if (!donationId || !donationIds.has(donationId)) {
      warnings.push(`${label}: order was not imported, line skipped`);
      continue;
    }
    if (!itemId || !itemIds.has(itemId)) {
      warnings.push(`${label}: unknown item_key "${row.item_key}", line skipped`);
      continue;
    }
    if (lineNo === null) {
      warnings.push(`${label}: no valid line_no, line skipped`);
      continue;
    }

    const id = `${donationId}-${lineNo}`;
    const data = {
      donationId,
      itemId,
      lineNo,
      variant: cleanText(row.variant),
      quantity: cleanQuantity(row.quantity),
    };
    await prisma.donationEntry.upsert({ where: { id }, update: data, create: { id, ...data } });
    entryCount++;
  }

  console.log(`Imported ${itemCount} items, ${donationCount} donations, ${entryCount} line items.`);
  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const warning of warnings) console.log(`  - ${warning}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
