import "dotenv/config";

// leaves the test database empty, as the API tests expect
export default async function globalTeardown() {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

  const { clearFixtures } = await import("../fixtures/donation");
  await clearFixtures();
}
