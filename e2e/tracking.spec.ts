import { expect, test } from "@playwright/test";

// Orders come from tests/fixtures/donation.ts

test.beforeEach(async ({ page }) => {
  await page.goto("/#track");
});

test("tracks a delivered order by its number", async ({ page }) => {
  await page.getByLabel("Order number").fill("#TEST-A1");
  await page.getByRole("button", { name: "Track", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Delivered to Recipient A" })).toBeVisible();
  await expect(page.getByText("Infusion Pump")).toBeVisible();
  await expect(page.getByText("IV Giving Set")).toBeVisible();
});

test("shows an open order as being prepared", async ({ page }) => {
  await page.getByLabel("Order number").fill("#TEST-A2");
  await page.getByRole("button", { name: "Track", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Being prepared for Recipient A" })).toBeVisible();
});

test("explains when no order matches", async ({ page }) => {
  await page.getByLabel("Order number").fill("#NOPE");
  await page.getByRole("button", { name: "Track", exact: true }).click();

  await expect(page.getByRole("alert")).toHaveText("No order found for “#NOPE”. Check the number and try again.");
});

test("asks for an order number when the search is empty", async ({ page }) => {
  await page.getByRole("button", { name: "Track", exact: true }).click();

  await expect(page.getByRole("alert")).toHaveText("Enter an order number to search.");
});

test("finds an order by browsing, then tracks it", async ({ page }) => {
  await page.getByRole("button", { name: /Don.t have an order number\?/ }).click();

  const results = page.getByRole("table");
  await expect(results.getByRole("rowheader")).toHaveText(["#TEST-A1", "#TEST-A2", "#TEST-B1"]);

  await page.getByLabel("Status").selectOption({ label: "Open" });
  await expect(results.getByRole("rowheader")).toHaveText(["#TEST-A2"]);

  await page.getByRole("button", { name: "Track order #TEST-A2" }).click();
  await expect(page.getByRole("heading", { name: "Being prepared for Recipient A" })).toBeVisible();
  await expect(page.getByLabel("Order number")).toHaveValue("#TEST-A2");
});
