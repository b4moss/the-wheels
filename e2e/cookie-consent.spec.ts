import { expect, test } from "@playwright/test";
import {
  readCookieConsentStorage,
  resetCookieConsentDemo,
} from "./helpers";

test.describe("CookieConsent", () => {
  test("pending banner after reset; reload keeps pending", async ({
    page,
  }) => {
    await resetCookieConsentDemo(page);

    const layer = page.locator("#cookie-demo [data-tw-snackbar-layer]");
    await expect(layer).toBeVisible();
    await expect(layer.locator(".cookie-consent-banner")).toBeVisible();

    const state = await readCookieConsentStorage(page);
    expect(state?.status).toBe("pending");
    expect(state?.bannerHidden).toBe(false);

    await page.reload();
    await expect(
      page.locator("#cookie-demo [data-tw-snackbar-layer]"),
    ).toBeVisible();
    const afterReload = await readCookieConsentStorage(page);
    expect(afterReload?.status).toBe("pending");
  });

  test("acceptAll hides banner and marks all services accepted", async ({
    page,
  }) => {
    await resetCookieConsentDemo(page);

    await page.locator("[data-tw-cookie-accept-all]").click();

    await expect(
      page.locator("#cookie-demo [data-tw-snackbar-layer]"),
    ).toBeHidden();

    const state = await readCookieConsentStorage(page);
    expect(state?.status).toBe("accepted");
    expect(state?.bannerHidden).toBe(true);
    expect(state?.services).toMatchObject({
      analytics: true,
      ads: true,
      personalization: true,
    });

    for (const id of ["analytics", "ads", "personalization"]) {
      await expect(
        page.locator(`[data-cookie-service="${id}"]`),
      ).toBeChecked();
    }

    await page.reload();
    await expect(
      page.locator("#cookie-demo [data-tw-snackbar-layer]"),
    ).toBeHidden();
  });

  test("service toggles yield partial then rejected; Apply bad JSON is safe", async ({
    page,
  }) => {
    await resetCookieConsentDemo(page);

    const analytics = page.locator('[data-cookie-service="analytics"]');
    const ads = page.locator('[data-cookie-service="ads"]');
    const personalization = page.locator(
      '[data-cookie-service="personalization"]',
    );
    const editor = page.locator("#cookie-storage-json");
    const status = page.locator("#cookie-storage-status");

    await analytics.check();
    await expect
      .poll(async () => (await readCookieConsentStorage(page))?.status)
      .toBe("partial");
    await expect(editor).toHaveValue(/"status":\s*"partial"/);

    await analytics.uncheck();
    await ads.check();
    await ads.uncheck();
    await personalization.check();
    await personalization.uncheck();
    await expect
      .poll(async () => (await readCookieConsentStorage(page))?.status)
      .toBe("rejected");
    await expect(editor).toHaveValue(/"status":\s*"rejected"/);

    await editor.fill("{not-json");
    await page.locator("#cookie-storage-apply").click();
    await expect(status).toContainText("JSON");
    await expect(page.locator("#cookie-demo")).toBeAttached();
  });

  test("settings dismisses banner but keeps pending", async ({ page }) => {
    await resetCookieConsentDemo(page);

    await page.locator("[data-tw-cookie-settings]").click();

    await expect(
      page.locator("#cookie-demo [data-tw-snackbar-layer]"),
    ).toBeHidden();

    const state = await readCookieConsentStorage(page);
    expect(state?.status).toBe("pending");
    expect(state?.bannerHidden).toBe(true);
  });
});
