import { expect, test } from "@playwright/test";

test.describe("Combobox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/combobox/");
    await expect(page.locator("#cb-static")).toBeAttached();
  });

  test("static: search filters, select updates value, empty query restores", async ({
    page,
  }) => {
    const host = page.locator("#cb-static");
    const trigger = host.locator('[slot="trigger"], .trigger').first();
    const search = host.locator(".combobox-search");
    const options = host.locator("[data-tw-option]");
    const valueOut = page.locator("#cb-static-value");

    await trigger.click();
    await expect(host).toHaveAttribute("open", "");
    await expect(search).toBeVisible();
    await expect(options.first()).toBeVisible();
    const initialCount = await options.count();
    expect(initialCount).toBeGreaterThan(0);

    await search.fill("zzz-no-match");
    await expect(options).toHaveCount(0);

    await search.fill("");
    await expect(options).not.toHaveCount(0);
    await expect
      .poll(async () => options.count())
      .toBe(initialCount);

    await options.first().click();
    await expect(host).not.toHaveAttribute("open");
    await expect(valueOut).toContainText("value:");
    await expect(valueOut).not.toContainText("(未選択)");
  });

  test("async: opens at top and loads more on scroll", async ({ page }) => {
    const host = page.locator("#cb-async");
    const trigger = host.locator('[slot="trigger"], .trigger').first();
    const viewport = host.locator(".infinite-scroll-viewport");
    const items = host.locator(".infinite-scroll-item");

    await trigger.click();
    await expect(host).toHaveAttribute("open", "");
    await expect(items.first()).toBeVisible();

    await expect
      .poll(async () =>
        viewport.evaluate((el) => ({
          scrollTop: el.scrollTop,
          count: el.querySelectorAll(".infinite-scroll-item").length,
        })),
      )
      .toMatchObject({ scrollTop: 0 });

    const initialCount = await items.count();
    expect(initialCount).toBeGreaterThan(0);

    await viewport.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    await expect
      .poll(async () => items.count())
      .toBeGreaterThan(initialCount);

    await page.keyboard.press("Escape");
    await expect(host).not.toHaveAttribute("open");
    await trigger.click();
    await expect(host).toHaveAttribute("open", "");
    await expect
      .poll(async () =>
        viewport.evaluate((el) => el.scrollTop),
      )
      .toBe(0);
    await expect(items.first()).toBeVisible();
  });

  test("hybrid: opens with list at top and accepts search", async ({ page }) => {
    const host = page.locator("#cb-hybrid");
    const trigger = host.locator('[slot="trigger"], .trigger').first();
    const search = host.locator(".combobox-search");
    const viewport = host.locator(".infinite-scroll-viewport");
    const options = host.locator("[data-tw-option]");

    await trigger.click();
    await expect(host).toHaveAttribute("open", "");
    await expect(options.first()).toBeVisible();
    await expect
      .poll(async () =>
        viewport.evaluate((el) => el.scrollTop),
      )
      .toBe(0);

    await search.fill("Apple");
    await expect
      .poll(async () => options.count())
      .toBeGreaterThan(0);
  });
});
