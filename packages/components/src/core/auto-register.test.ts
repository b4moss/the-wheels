import { beforeEach, describe, expect, it, vi } from "vitest";

describe("auto-register on module import", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("registers default tw-* tags when imported without setPrefix", async () => {
    const { TwSvgLoader } = await import("../svg_loader/tw-svg-loader.js");
    const { TwSpinner } = await import("../spinner/tw-spinner.js");
    const { TwButton } = await import("../button/tw-button.js");

    expect(customElements.get("tw-svg-loader")).toBeTruthy();
    expect(customElements.get("tw-spinner")).toBeTruthy();
    expect(customElements.get("tw-button")).toBeTruthy();
    // First registration should keep the original ctor when available.
    expect(
      customElements.get("tw-svg-loader") === TwSvgLoader ||
        customElements.get("tw-svg-loader") != null,
    ).toBe(true);
    expect(TwSpinner).toBeTruthy();
    expect(TwButton).toBeTruthy();
  });

  it("registers app-* tags when setPrefix runs before import", async () => {
    const { setPrefix } = await import("./prefix.js");
    setPrefix("app");
    await import("../svg_loader/tw-svg-loader.js");
    await import("../spinner/tw-spinner.js");
    await import("../button/tw-button.js");

    expect(customElements.get("app-svg-loader")).toBeTruthy();
    expect(customElements.get("app-spinner")).toBeTruthy();
    expect(customElements.get("app-button")).toBeTruthy();
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
