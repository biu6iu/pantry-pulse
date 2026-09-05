// Run manually with: npx tsx scripts/import-data.ts <path-to-csv>

import "dotenv/config";
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { prisma } from "../src/lib/config/db";

interface CsvRow {
  Name: string;
  Email: string;
  Status: string;
  "Created At": string;
  "Completed At": string;
  Notes: string;
  "Item Quantity": string;
  "Item Name": string;
  "Item Sku": string;
  "Shipping Name": string;
  "Shipping Company": string;
  "Shipping Street": string;
  "Shipping City": string;
  "Shipping Zip": string;
  "Shipping Province": string;
  "Shipping Country": string;
  "Shipping Phone": string;
}

// cleaning helpers

/** Trims a value and turns an empty string into null. */
function cleanText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

// Excel prefixes some exported values with a leading apostrophe to force text formatting 
function stripExcelApostrophe(value: string): string {
  return value.startsWith("'") ? value.slice(1) : value;
}

function cleanZip(value: string | undefined): string | null {
  if (!value) return null;
  return cleanText(stripExcelApostrophe(value));
}

// Strips the Excel apostrophe and collapses repeated internal whitespace (source has both "0412 157 571" and "0412157571" style entries)
function cleanPhone(value: string | undefined): string | null {
  if (!value) return null;
  const stripped = stripExcelApostrophe(value.trim());
  return cleanText(stripped.replace(/\s+/g, " "));
}

// Normalises casing/whitespace only 
function cleanStatus(value: string | undefined): string {
  return value?.trim().toLowerCase() || "unknown";
}

function cleanQuantity(value: string | undefined): number {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parseCsvDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}


async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npx tsx scripts/import-data.ts <path-to-csv>");
    process.exit(1);
  }

  const raw = readFileSync(csvPath, "utf8");
  const rows: CsvRow[] = parse(raw, { columns: true, skip_empty_lines: true });

  // Each CSV row is one line item. A donation order spans several rows that share the same "Name" (e.g. "#D5" appears twice, once per item)
  const groups = new Map<string, CsvRow[]>();
  for (const row of rows) {
    const key = row.Name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  let donationCount = 0;
  let entryCount = 0;
  const warnings: string[] = [];

  for (const [donationId, groupRows] of groups) {
    // Order-level fields (status, dates, address) are only populated on the
    // row that carries them; line-item rows leave them blank.
    const header = groupRows.find((r) => r.Status) ?? groupRows[0];

    const email = cleanText(header.Email)?.toLowerCase();
    if (!email) {
      warnings.push(`${donationId}: no email, skipped entirely`);
      continue;
    }

    const createdAt = parseCsvDate(header["Created At"]);
    if (!createdAt) {
      warnings.push(`${donationId}: no valid Created At date, skipped entirely`);
      continue;
    }

    const shippingCompany = cleanText(header["Shipping Company"]);
    const shippingName = cleanText(header["Shipping Name"]);
    const orgName = shippingCompany ?? shippingName ?? "Unknown organisation";
    if (!shippingCompany) {
      warnings.push(`${donationId}: no Shipping Company, used "${orgName}" as the recipient name instead`);
    }

    // One recipient User per email; upsert so re-running the script is safe
    // NOTE: `update: {}` means the first order processed for an email wins
    // E.g. if the same email shows up under two different company names in the source data, later ones won't overwrite it
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: orgName,
        contactName: shippingName,
        email,
        street: cleanText(header["Shipping Street"]),
        city: cleanText(header["Shipping City"]),
        zip: cleanZip(header["Shipping Zip"]),
        province: cleanText(header["Shipping Province"]),
        country: cleanText(header["Shipping Country"]),
        phone: cleanPhone(header["Shipping Phone"]),
      },
    });

    await prisma.donation.upsert({
      where: { id: donationId },
      update: {},
      create: {
        id: donationId,
        status: cleanStatus(header.Status),
        createdAt,
        completedAt: parseCsvDate(header["Completed At"]),
        desc: cleanText(header.Notes),
        recipientId: user.id,
      },
    });
    donationCount++;

    // Re-running the script must not duplicate line items for a donation that's already been imported
    await prisma.donationEntry.deleteMany({ where: { donationId } });

    for (const row of groupRows) {
      const itemName = cleanText(row["Item Name"]);
      if (!itemName) continue;

      let item = await prisma.donatedItem.findFirst({ where: { name: itemName } });
      if (!item) {
        item = await prisma.donatedItem.create({
          data: { name: itemName, sku: cleanText(row["Item Sku"]) },
        });
      }

      await prisma.donationEntry.create({
        data: {
          donationId,
          itemId: item.id,
          quantity: cleanQuantity(row["Item Quantity"]),
        },
      });
      entryCount++;
    }
  }

  console.log(`Imported ${donationCount} donations, ${entryCount} line items.`);
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
