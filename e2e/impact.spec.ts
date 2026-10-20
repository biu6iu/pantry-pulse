import { expect, test } from "@playwright/test";

// Figures come from tests/fixtures/donation.ts: two completed orders (#TEST-A1, #TEST-B1) to two recipients,
// 14 items between them, plus one open order (#TEST-A2) that doesn't count towards impact.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("shows the impact totals worked out from completed orders", async ({ page }) => {
  // the figure on the stat card with this exact label
  const figure = (label: string) =>
    page
      .locator(".impact-contribution__card")
      .filter({ has: page.getByText(label, { exact: true }) })
      .locator(".impact-contribution__value");

  await expect(figure("organisations have received supplies")).toHaveText("2");
  await expect(figure("medical items given a second life instead of going to landfill")).toHaveText("14");
  await expect(figure("deliveries made")).toHaveText("2");
});

test("shows the health and emissions breakdowns", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Health Impacts Made" })).toBeVisible();

  const emissions = page.locator(".impact-breakdown").filter({
    has: page.getByRole("heading", { name: "Which supplies save the most emissions" }),
  });
  await expect(emissions).toBeVisible();
  await expect(emissions.getByText("Equipment")).toBeVisible();
  await expect(emissions.getByText("Medical Supplies")).toBeVisible();
});

test("links from the emissions breakdown to how impact is measured", async ({ page }) => {
  const emissions = page.locator(".impact-breakdown").filter({
    has: page.getByRole("heading", { name: "Which supplies save the most emissions" }),
  });
  await emissions.getByRole("link", { name: "How we measure this" }).click();

  await expect(page).toHaveURL(/#how-we-measure$/);
  await expect(page.getByRole("heading", { name: "How we measure impact" })).toBeInViewport();
  await expect(page.getByRole("link", { name: "Greenhouse gas reporting: conversion factors 2022" })).toBeVisible();
});
