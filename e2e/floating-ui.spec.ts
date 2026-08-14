import { expect, test, type Locator } from "@playwright/test";
import {
  actionMenuPanel,
  actionMenuTrigger,
  dropdownPanel,
  expectMostlyInViewport,
  openDropdownByTrigger,
} from "./helpers";

async function closeIfOpen(host: Locator): Promise<void> {
  if ((await host.getAttribute("open")) !== null) {
    await host.page().keyboard.press("Escape");
    await expect(host).not.toHaveAttribute("open");
  }
}

test.describe("Floating UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dropdown-placement/");
    await expect(page.locator('[data-tw-fixture="edge-stage"]')).toBeVisible();
  });

  test("edge and center triggers open Dropdown panels in viewport", async ({
    page,
  }) => {
    const edges = ["center", "top", "bottom", "left", "right"] as const;

    for (const edge of edges) {
      const host = page.locator(
        `[data-tw-edge="${edge}"] [data-tw-fixture="dropdown"]`,
      );
      const trigger = page.locator(`#dd-edge-${edge}-trigger`);
      await closeIfOpen(host);
      const panel = await openDropdownByTrigger(host, trigger);
      await expectMostlyInViewport(panel);
      await panel.locator("[data-tw-fixture-item]").first().click();
      await expect(panel).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(host).not.toHaveAttribute("open");
    }
  });

  test("required placements stay in viewport and reopen", async ({ page }) => {
    const placements = [
      "bottom-start",
      "top-end",
      "left-start",
      "right-end",
    ] as const;

    for (const placement of placements) {
      const host = page.locator(
        `[data-tw-fixture="dropdown"][data-tw-placement="${placement}"]`,
      );
      const trigger = page.locator(
        `#dd-place-${placement}-trigger`,
      );
      await closeIfOpen(host);

      let panel = await openDropdownByTrigger(host, trigger);
      await expectMostlyInViewport(panel);
      await page.keyboard.press("Escape");
      await expect(host).not.toHaveAttribute("open");

      panel = await openDropdownByTrigger(host, trigger);
      await expectMostlyInViewport(panel);
      await page.keyboard.press("Escape");
    }
  });

  test("invalid placement still opens inside viewport", async ({ page }) => {
    const host = page.locator(
      '[data-tw-fixture="dropdown"][data-tw-placement="invalid"]',
    );
    const trigger = page.locator("#dd-place-invalid-trigger");
    const panel = await openDropdownByTrigger(host, trigger);
    await expectMostlyInViewport(panel);
  });

  test("ActionMenu at edges stays in viewport and supports item click", async ({
    page,
  }) => {
    const hosts = page.locator('[data-tw-fixture="action-menu"]');
    const count = await hosts.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const host = hosts.nth(i);
      const trigger = actionMenuTrigger(host);
      const panel = actionMenuPanel(host);

      await closeIfOpen(host);
      await trigger.click();
      await expect(host).toHaveAttribute("open", "");
      await expect(panel).toBeVisible();
      await expectMostlyInViewport(panel);
      await panel.locator("[data-tw-fixture-item]").first().click();
      await expect(host).not.toHaveAttribute("open");
    }
  });

  test("opening different edge triggers in sequence does not throw", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    for (const edge of ["top", "right", "bottom", "left", "center"] as const) {
      const host = page.locator(
        `[data-tw-edge="${edge}"] [data-tw-fixture="dropdown"]`,
      );
      const trigger = page.locator(`#dd-edge-${edge}-trigger`);
      await closeIfOpen(host);
      await openDropdownByTrigger(host, trigger);
      await expect(dropdownPanel(host)).toBeVisible();
      await page.keyboard.press("Escape");
    }

    expect(errors).toEqual([]);
  });
});
