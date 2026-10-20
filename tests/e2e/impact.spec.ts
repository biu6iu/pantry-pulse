import { expect, test } from "@playwright/test";

// Figures come from tests/fixtures/donation.ts: two completed orders (#TEST-A1, #TEST-B1) to two recipients,
// 14 items between them, plus one open order (#TEST-A2) that doesn't count towards impact.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("shows the impact totals worked out from completed orders", async ({ page }) => {
  // the figure on the stat card with this exact label; each counts up from 0 once it scrolls into view
  async function expectFigure(label: string, value: string) {
    const card = page
      .locator(".impact-contribution__card")
      .filter({ has: page.getByText(label, { exact: true }) });
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator(".impact-contribution__value")).toHaveText(value);
  }

  await expectFigure("organisations have received supplies", "2");
  await expectFigure("medical items given a second life instead of going to landfill", "14");
  await expectFigure("deliveries made", "2");
});

test("shows the health and environmental breakdowns", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Health Impacts" })).toBeVisible();

  const environmental = page.locator(".impact-breakdown").filter({
    has: page.getByRole("heading", { name: "Environmental Impacts Made" }),
  });
  await expect(environmental).toBeVisible();
  await expect(environmental.getByText("Equipment")).toBeVisible();
  await expect(environmental.getByText("Medical Supplies")).toBeVisible();
});

test("links from the environmental breakdown to how impact is measured", async ({ page }) => {
  const environmental = page.locator(".impact-breakdown").filter({
    has: page.getByRole("heading", { name: "Environmental Impacts Made" }),
  });
  await environmental.getByRole("link", { name: "How we measure this" }).click();

  await expect(page).toHaveURL(/#how-we-measure$/);
  await expect(page.getByRole("heading", { name: "How we measure impact" })).toBeInViewport();
  await expect(page.getByRole("link", { name: "Greenhouse gas reporting: conversion factors 2022" })).toBeVisible();
});
