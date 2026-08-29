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

  test("coverflow autoplays to the next service and has no helper line", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/hover to pause/i)).toHaveCount(0);
    const catalogue = page.getByRole("region", { name: /physiotherapy services/i });
    await catalogue.scrollIntoViewIfNeeded();
    await expect(catalogue.getByRole("link", { name: /dry needling/i })).toBeVisible();
    await expect(catalogue.getByRole("link", { name: /manual therapy/i })).toBeVisible({
      timeout: 9000,
    });
  });

  test("coverflow wraps last to first and first to last without leaving the strip", async ({
    page,
  }) => {
    await page.goto("/");
    const catalogue = page.getByRole("region", { name: /physiotherapy services/i });
    await catalogue.scrollIntoViewIfNeeded();
    await catalogue.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(catalogue.getByRole("link", { name: /shoulder rehabilitation/i })).toBeVisible();
    // Let the silent rewind land on the last real card before wrapping forward.
    await page.waitForTimeout(1400);
    await page.keyboard.press("ArrowRight");
    await expect(catalogue.getByRole("link", { name: /dry needling/i })).toBeVisible();
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

  test("public book CTAs stay on native /book", async ({ page }) => {
    await page.goto("/");
    const homeBookHrefs = await page
      .getByRole("link", { name: /book appointment/i })
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(homeBookHrefs.length).toBeGreaterThan(0);
    expect(homeBookHrefs.every((href) => href === "/book" || href?.startsWith("/book"))).toBe(
      true,
    );

    await page.goto("/book");
    await expect(page).toHaveURL(/\/book\/?$/);

    const bookHtml = await page.content();
    expect(bookHtml).not.toMatch(/setmore\.com/i);
    expect(bookHtml).not.toMatch(/Book via Setmore/i);
    expect(bookHtml).not.toMatch(/scheduling partner/i);

    await page.goto("/terms");
    const termsHtml = await page.content();
    expect(termsHtml).not.toMatch(/setmore\.com/i);
    expect(termsHtml).not.toMatch(/external scheduling partner/i);
  });
});
