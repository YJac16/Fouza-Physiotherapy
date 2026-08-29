import { test, expect } from "@playwright/test";

test.describe("marketing smoke", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("home services coverflow links to a service detail page", async ({ page }) => {
    await page.goto("/");
    const catalogue = page.getByRole("region", { name: /physiotherapy services/i });
    await expect(catalogue).toBeVisible();
    await catalogue.getByRole("link", { name: /dry needling/i }).first().click();
    await expect(page).toHaveURL(/\/services\/dry-needling/);
    await expect(page.getByRole("heading", { level: 1, name: /dry needling/i })).toBeVisible();
  });

  test("services page coverflow keeps booking on /book", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("region", { name: /physiotherapy services/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /book appointment/i }).first()).toHaveAttribute(
      "href",
      "/book",
    );
  });

  test("reduced motion falls back to a static services grid", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("region", { name: /physiotherapy services/i })).toHaveCount(0);
    await expect(page.getByText("Learn more").first()).toBeVisible();
    await page.getByRole("link", { name: /dry needling/i }).first().click();
    await expect(page).toHaveURL(/\/services\/dry-needling/);
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("health endpoint", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.status).toBe("ok");
  });
});
