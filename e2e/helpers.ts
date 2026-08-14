import { expect, type Locator, type Page } from "@playwright/test";

/** Max overflow past a viewport edge (matches Floating UI shift padding). */
export const VIEWPORT_OVERFLOW_PX = 8;

export function dropdownPanel(host: Locator): Locator {
  return host.locator(":scope > .panel");
}

export function actionMenuPanel(host: Locator): Locator {
  return host.locator('[data-tw-component="dropdown"] > .panel');
}

export function actionMenuTrigger(host: Locator): Locator {
  return host.locator(".action-menu-trigger, [slot='trigger']").first();
}

export async function expectMostlyInViewport(
  locator: Locator,
  overflowPx = VIEWPORT_OVERFLOW_PX,
): Promise<void> {
  await expect
    .poll(async () => {
      const box = await locator.boundingBox();
      if (!box) return false;
      const vp = locator.page().viewportSize();
      if (!vp) return false;
      const leftOverflow = Math.max(0, -box.x);
      const topOverflow = Math.max(0, -box.y);
      const rightOverflow = Math.max(0, box.x + box.width - vp.width);
      const bottomOverflow = Math.max(0, box.y + box.height - vp.height);
      return (
        leftOverflow < overflowPx &&
        topOverflow < overflowPx &&
        rightOverflow < overflowPx &&
        bottomOverflow < overflowPx
      );
    })
    .toBe(true);
}

export async function openDropdownByTrigger(
  host: Locator,
  trigger: Locator,
): Promise<Locator> {
  const panel = dropdownPanel(host);
  await trigger.click();
  await expect(host).toHaveAttribute("open", "");
  await expect(panel).toBeVisible();
  return panel;
}

export async function readCookieConsentStorage(
  page: Page,
  key = "tw-cookie-consent",
): Promise<{
  status?: string;
  bannerHidden?: boolean;
  services?: Record<string, boolean>;
} | null> {
  return page.evaluate((storageKey) => {
    const raw = localStorage.getItem(storageKey);
    if (raw == null || raw === "") return null;
    try {
      return JSON.parse(raw) as {
        status?: string;
        bannerHidden?: boolean;
        services?: Record<string, boolean>;
      };
    } catch {
      return null;
    }
  }, key);
}

export async function resetCookieConsentDemo(page: Page): Promise<void> {
  await page.goto("/cookie-consent/");
  await page.locator("#cookie-reset").click();
  await page.waitForURL("**/cookie-consent/**");
  await expect(
    page.locator("#cookie-demo [data-tw-snackbar-layer]"),
  ).toBeVisible();
}
