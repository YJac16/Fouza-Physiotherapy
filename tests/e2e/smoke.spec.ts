import { test, expect } from "@playwright/test";

test.describe("marketing smoke", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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
