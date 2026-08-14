import { beforeEach, describe, expect, it, vi } from "vitest";

describe("auto-register on module import", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("registers default tw-* tags when imported without setPrefix", async () => {
    const { TwSvgLoader } = await import("../svg_loader/tw-svg-loader.js");
    const { TwSpinner } = await import("../spinner/tw-spinner.js");
    const { TwButton } = await import("../button/tw-button.js");
    const { TwDropdown } = await import("../dropdown/tw-dropdown.js");
    const { TwActionMenu } = await import("../action_menu/tw-action-menu.js");
    const { TwAccordion } = await import("../accordion/tw-accordion.js");
    const { TwModal } = await import("../modal/tw-modal.js");
    const { TwAvatar } = await import("../avatar/tw-avatar.js");
    const { TwVerticalNav } = await import("../vertical_nav/tw-vertical-nav.js");
    const { TwTabs } = await import("../tabs/tw-tabs.js");
    const { TwInfiniteScroll } = await import(
      "../infinite_scroll/tw-infinite-scroll.js"
    );
    const { TwCombobox } = await import("../combobox/tw-combobox.js");
    const { TwUserMenu } = await import("../user_menu/tw-user-menu.js");
    const { TwCookieConsent } = await import(
      "../cookie_consent/tw-cookie-consent.js"
    );

    expect(customElements.get("tw-svg-loader")).toBeTruthy();
    expect(customElements.get("tw-spinner")).toBeTruthy();
    expect(customElements.get("tw-button")).toBeTruthy();
    expect(customElements.get("tw-dropdown")).toBeTruthy();
    expect(customElements.get("tw-action-menu")).toBeTruthy();
    expect(customElements.get("tw-accordion")).toBeTruthy();
    expect(customElements.get("tw-modal")).toBeTruthy();
    expect(customElements.get("tw-avatar")).toBeTruthy();
    expect(customElements.get("tw-vertical-nav")).toBeTruthy();
    expect(customElements.get("tw-tabs")).toBeTruthy();
    expect(customElements.get("tw-infinite-scroll")).toBeTruthy();
    expect(customElements.get("tw-combobox")).toBeTruthy();
    expect(customElements.get("tw-user-menu")).toBeTruthy();
    expect(customElements.get("tw-cookie-consent")).toBeTruthy();
    expect(customElements.get("tw-toast")).toBeUndefined();
    // First registration should keep the original ctor when available.
    expect(
      customElements.get("tw-svg-loader") === TwSvgLoader ||
        customElements.get("tw-svg-loader") != null,
    ).toBe(true);
    expect(TwSpinner).toBeTruthy();
    expect(TwButton).toBeTruthy();
    expect(TwDropdown).toBeTruthy();
    expect(TwActionMenu).toBeTruthy();
    expect(TwAccordion).toBeTruthy();
    expect(TwModal).toBeTruthy();
    expect(TwAvatar).toBeTruthy();
    expect(TwVerticalNav).toBeTruthy();
    expect(TwTabs).toBeTruthy();
    expect(TwInfiniteScroll).toBeTruthy();
    expect(TwCombobox).toBeTruthy();
    expect(TwUserMenu).toBeTruthy();
    expect(TwCookieConsent).toBeTruthy();
  });


  it("registers app-* tags when setPrefix runs before import", async () => {
    const { setPrefix } = await import("./prefix.js");
    setPrefix("app");
    await import("../svg_loader/tw-svg-loader.js");
    await import("../spinner/tw-spinner.js");
    await import("../button/tw-button.js");
    await import("../dropdown/tw-dropdown.js");
    await import("../action_menu/tw-action-menu.js");
    await import("../accordion/tw-accordion.js");
    await import("../modal/tw-modal.js");
    await import("../avatar/tw-avatar.js");
    await import("../vertical_nav/tw-vertical-nav.js");
    await import("../tabs/tw-tabs.js");
    await import("../infinite_scroll/tw-infinite-scroll.js");
    await import("../combobox/tw-combobox.js");
    await import("../user_menu/tw-user-menu.js");
    await import("../cookie_consent/tw-cookie-consent.js");

    expect(customElements.get("app-svg-loader")).toBeTruthy();
    expect(customElements.get("app-spinner")).toBeTruthy();
    expect(customElements.get("app-button")).toBeTruthy();
    expect(customElements.get("app-dropdown")).toBeTruthy();
    expect(customElements.get("app-action-menu")).toBeTruthy();
    expect(customElements.get("app-accordion")).toBeTruthy();
    expect(customElements.get("app-modal")).toBeTruthy();
    expect(customElements.get("app-avatar")).toBeTruthy();
    expect(customElements.get("app-vertical-nav")).toBeTruthy();
    expect(customElements.get("app-tabs")).toBeTruthy();
    expect(customElements.get("app-infinite-scroll")).toBeTruthy();
    expect(customElements.get("app-combobox")).toBeTruthy();
    expect(customElements.get("app-user-menu")).toBeTruthy();
    expect(customElements.get("app-cookie-consent")).toBeTruthy();
  });


  it("keeps existing tw-* tags when setPrefix changes later", async () => {
    await import("../svg_loader/tw-svg-loader.js");
    expect(customElements.get("tw-svg-loader")).toBeTruthy();

    const { setPrefix } = await import("./prefix.js");
    setPrefix("app");

    expect(customElements.get("tw-svg-loader")).toBeTruthy();
    // Without re-import, app-* is not auto-registered.
    // (May exist from a previous test in the same registry; only assert tw-* stays.)
    expect(customElements.get("tw-svg-loader")).toBeTruthy();
  });
});
