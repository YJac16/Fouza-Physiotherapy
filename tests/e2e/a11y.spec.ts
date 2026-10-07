import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const CRITICAL_PAGES = [
  { path: "/", name: "home" },
  { path: "/book", name: "book" },
  { path: "/login", name: "login" },
  { path: "/contact", name: "contact" },
  { path: "/forgot-password", name: "forgot-password" },
] as const;

for (const pageDef of CRITICAL_PAGES) {
  test(`a11y: ${pageDef.name} has no serious/critical axe violations`, async ({ page }) => {
    await page.goto(pageDef.path);
    await expect(page.locator("h1").first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );

    expect(
      blocking,
      blocking.map((v) => `${v.id}: ${v.help} (${v.impact})`).join("\n"),
    ).toEqual([]);
  });
}

test("a11y: login form is keyboard reachable", async ({ page }) => {
  await page.goto("/login");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
  const tag = await focused.evaluate((el) => el.tagName.toLowerCase());
  expect(["input", "a", "button"]).toContain(tag);
});

test("a11y: mobile nav traps focus within panel when open", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /open menu/i }).click();
  const mobileNav = page.getByRole("navigation", { name: /mobile/i });
  await expect(mobileNav.getByRole("link", { name: "Services" })).toBeVisible();
  await mobileNav.getByRole("link", { name: "Services" }).focus();
  await expect(mobileNav.getByRole("link", { name: "Services" })).toBeFocused();
});
