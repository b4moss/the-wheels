import { expect, test } from "@playwright/test";
import {
  actionMenuPanel,
  actionMenuTrigger,
} from "./helpers";

test.describe("overlays", () => {
  test.describe("Modal", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/modal/");
      await expect(page.locator("#demo-modal")).toBeAttached();
    });

    test("opens, closes via ×, and reopens", async ({ page }) => {
      const modal = page.locator("#demo-modal");
      const dialog = modal.locator("dialog.modal");
      const closer = modal.locator(".modal-close[data-tw-modal-close]");

      await page.locator("#open-modal").click();
      await expect(dialog).toBeVisible();

      await modal.evaluate((el) => {
        (el as HTMLElement & { showModal?: () => void }).showModal?.();
      });
      await expect(dialog).toBeVisible();

      await closer.click();
      await expect(dialog).toBeHidden();

      // Closed-state closer must not throw / reopen (button is not visible).
      await closer.evaluate((el) => (el as HTMLButtonElement).click());
      await expect(dialog).toBeHidden();

      await page.locator("#open-modal").click();
      await expect(dialog).toBeVisible();
    });

    test("closes via backdrop click on dialog", async ({ page }) => {
      const modal = page.locator("#demo-modal");
      const dialog = modal.locator("dialog.modal");

      await page.locator("#open-modal").click();
      await expect(dialog).toBeVisible();

      await dialog.evaluate((el) => {
        el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await expect(dialog).toBeHidden();
    });
  });

  test.describe("ActionMenu", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/action-menu/");
      await expect(
        page.locator('[data-tw-component="action-menu"]').first(),
      ).toBeAttached();
    });

    test("opens, closes via outside / Escape / item / toggle", async ({
      page,
    }) => {
      const menu = page.locator('[data-tw-component="action-menu"]').first();
      const trigger = actionMenuTrigger(menu);
      const panel = actionMenuPanel(menu);

      await page.keyboard.press("Escape");
      await expect(menu).not.toHaveAttribute("open");

      await trigger.click();
      await expect(menu).toHaveAttribute("open", "");
      await expect(panel).toBeVisible();

      await page.locator("h1").click({ position: { x: 4, y: 4 } });
      await expect(menu).not.toHaveAttribute("open");

      await trigger.click();
      await expect(menu).toHaveAttribute("open", "");
      await page.keyboard.press("Escape");
      await expect(menu).not.toHaveAttribute("open");

      await trigger.click();
      await panel.locator("button").first().click();
      await expect(menu).not.toHaveAttribute("open");

      await trigger.click();
      await expect(menu).toHaveAttribute("open", "");
      await trigger.click();
      await expect(menu).not.toHaveAttribute("open");
    });
  });

  test.describe("Accordion", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/accordion/");
      await expect(
        page.locator('[data-tw-component="accordion"]').first(),
      ).toBeAttached();
    });

    test("toggles open state on header clicks", async ({ page }) => {
      const accordion = page
        .locator('[data-tw-component="accordion"]')
        .first();
      const summary = accordion.locator("summary").first();

      await expect(accordion).not.toHaveAttribute("open");
      await summary.click();
      await expect(accordion).toHaveAttribute("open", "");
      await summary.click();
      await expect(accordion).not.toHaveAttribute("open");

      await summary.click();
      await summary.click();
      await summary.click();
      await expect(accordion).toHaveAttribute("open", "");
    });
  });
});
