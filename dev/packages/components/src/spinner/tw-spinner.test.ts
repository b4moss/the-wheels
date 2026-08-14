import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwSvgLoader } from "../svg_loader/tw-svg-loader.js";
import { DEFAULT_SPINNER_SRC, TwSpinner } from "./tw-spinner.js";

function spinnerTag(): string {
  return `${getPrefix()}spinner`;
}

function loaderTag(): string {
  return `${getPrefix()}svg-loader`;
}

async function mountSpinner(
  attrs: Record<string, string> = {},
): Promise<TwSpinner> {
  const el = document.createElement(spinnerTag()) as TwSpinner;
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  document.body.append(el);
  await Promise.resolve();
  return el;
}

describe("TwSpinner", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("svg-loader", TwSvgLoader);
    defineComponent("spinner", TwSpinner);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9"/></svg>',
          { status: 200, headers: { "Content-Type": "image/svg+xml" } },
        ),
      ),
    );
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sets data-tw-component=spinner on connect", async () => {
    const el = await mountSpinner();
    expect(el.getAttribute("data-tw-component")).toBe("spinner");
  });

  it("uses bundled spinner.svg when src is omitted", async () => {
    const el = await mountSpinner();
    const loader = el.querySelector(loaderTag());
    expect(loader).not.toBeNull();
    expect(loader!.getAttribute("src")).toBe(DEFAULT_SPINNER_SRC);
  });

  it("forwards custom src to SVGLoader", async () => {
    const el = await mountSpinner({ src: "/custom-spinner.svg" });
    const loader = el.querySelector(loaderTag());
    expect(loader!.getAttribute("src")).toBe("/custom-spinner.svg");
  });

  it("defaults internal size to 1em", async () => {
    const el = await mountSpinner();
    const loader = el.querySelector(loaderTag()) as HTMLElement;
    expect(loader.style.width).toBe("1em");
    expect(loader.style.height).toBe("1em");
  });

  it("forwards width and height to SVGLoader", async () => {
    const el = await mountSpinner({ width: "32", height: "32" });
    const loader = el.querySelector(loaderTag())!;
    expect(loader.getAttribute("width")).toBe("32");
    expect(loader.getAttribute("height")).toBe("32");
  });

  it("forwards appearance attributes to SVGLoader", async () => {
    const el = await mountSpinner({ "stroke-color": "#494949", padding: "2" });
    const loader = el.querySelector(loaderTag())!;
    expect(loader.getAttribute("stroke-color")).toBe("#494949");
    expect(loader.getAttribute("padding")).toBe("2");
  });

  it("does not throw on connect when rendering may fail", () => {
    expect(() => {
      const el = document.createElement(spinnerTag());
      el.setAttribute("src", "/does-not-matter.svg");
      document.body.append(el);
    }).not.toThrow();
  });
});
