import "dotenv/config";
import { execSync } from "node:child_process";

// Points the database at TEST_DATABASE_URL, applies migrations and seeds the same fixtures the API tests use.
// Shares the test database with `npm run test`, so don't run the two at once.
export default async function globalSetup() {
  const testDbUrl = process.env.TEST_DATABASE_URL;
  if (!testDbUrl) {
    throw new Error("TEST_DATABASE_URL is not set in .env.");
  }

  process.env.DATABASE_URL = testDbUrl;
  process.env.DIRECT_URL = testDbUrl;

  execSync("npx prisma migrate deploy", { env: process.env, stdio: "inherit" });

  // imported after DATABASE_URL is set, since the Prisma client reads it on import
  const { seedFixtures, clearFixtures } = await import("../fixtures/donation");
  await clearFixtures();
  await seedFixtures();
}
