import { expect, test } from "@playwright/test";

test.describe("InfiniteScroll", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/infinite-scroll/");
    await expect(page.locator("#is-demo")).toBeAttached();
  });

  test("shows initial items and loads more near bottom", async ({ page }) => {
    const host = page.locator("#is-demo");
    const viewport = host.locator(".infinite-scroll-viewport");
    const items = host.locator(".infinite-scroll-item");

    await expect(items.first()).toBeVisible();
    const initialCount = await items.count();
    expect(initialCount).toBeGreaterThan(0);

    await viewport.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    await expect
      .poll(async () => items.count())
      .toBeGreaterThan(initialCount);

    const afterDown = await items.count();

    await viewport.evaluate((el) => {
      el.scrollTop = 0;
    });
    await viewport.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    await expect
      .poll(async () => items.count())
      .toBeGreaterThanOrEqual(afterDown);

    const finalCount = await items.count();
    expect(finalCount).toBeLessThanOrEqual(40);
  });
});
