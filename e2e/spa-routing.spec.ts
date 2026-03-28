import { expect, test } from "@playwright/test";

test.describe("SPA routing", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test("homepage loads with country list", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toContainText(
      "Developer Rankings",
      { timeout: 15000 },
    );
  });

  test("navigate from homepage to country page without reload", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toContainText(
      "Developer Rankings",
      { timeout: 15000 },
    );

    await page.locator("a", { hasText: "Taiwan" }).first().click();
    await expect(page).toHaveURL(/taiwan/, { timeout: 10000 });
    await expect(page.locator("h1").first()).toContainText("Taiwan", {
      timeout: 10000,
    });
  });

  test("navigate from country page to profile page without reload", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toContainText(
      "Developer Rankings",
      { timeout: 15000 },
    );

    await page.locator("a", { hasText: "Taiwan" }).first().click();
    await expect(page).toHaveURL(/taiwan/, { timeout: 10000 });

    const devLink = page.locator(".divide-y a").first();
    await devLink.waitFor({ timeout: 15000 });
    await devLink.click();
    await expect(page).toHaveURL(/taiwan\/.+/, { timeout: 10000 });
  });

  test("browser back navigates between SPA pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toContainText(
      "Developer Rankings",
      { timeout: 15000 },
    );

    // Navigate to Taiwan
    await page.locator("a", { hasText: "Taiwan" }).first().click();
    await expect(page).toHaveURL(/taiwan/, { timeout: 10000 });
    await expect(page.locator("h1").first()).toContainText("Taiwan", {
      timeout: 10000,
    });

    // Navigate to a profile
    const devLink = page.locator(".divide-y a").first();
    await devLink.waitFor({ timeout: 15000 });
    await devLink.click();
    await expect(page).toHaveURL(/taiwan\/.+/, { timeout: 10000 });

    // Go back to country page
    await page.goBack();
    await expect(page).toHaveURL(/taiwan\/?$/, { timeout: 10000 });
    await expect(page.locator("h1").first()).toContainText("Taiwan", {
      timeout: 15000,
    });
  });

  test("FAQ page accessible via client-side navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toContainText(
      "Developer Rankings",
      { timeout: 15000 },
    );

    await page.locator("a", { hasText: "FAQ" }).first().click();
    await expect(page).toHaveURL(/faq/, { timeout: 10000 });
  });

  test("locale switch works on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toContainText(
      "Developer Rankings",
      { timeout: 15000 },
    );

    await page.locator("button", { hasText: "中文" }).click();
    await expect(page).toHaveURL(/zh-TW/, { timeout: 10000 });
  });
});
