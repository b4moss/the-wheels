import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwSvgLoader } from "./tw-svg-loader.js";

const SAMPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
const SAMPLE_SVG_B =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24"/></svg>';

function tag(): string {
  return `${getPrefix()}svg-loader`;
}

async function mount(attrs: Record<string, string> = {}): Promise<TwSvgLoader> {
  const el = document.createElement(tag()) as TwSvgLoader;
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  document.body.append(el);
  await Promise.resolve();
  await Promise.resolve();
  return el;
}

describe("TwSvgLoader", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("svg-loader", TwSvgLoader);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("missing")) {
          return new Response("nope", { status: 404 });
        }
        if (url.includes("server-error")) {
          return new Response("err", { status: 500 });
        }
        if (url.includes("network-fail")) {
          throw new TypeError("Failed to fetch");
        }
        if (url.includes("not-svg")) {
          return new Response("not-svg", {
            status: 200,
            headers: { "Content-Type": "text/plain" },
          });
        }
        if (url.includes("svg-b")) {
          return new Response(SAMPLE_SVG_B, {
            status: 200,
            headers: { "Content-Type": "image/svg+xml" },
          });
        }
        return new Response(SAMPLE_SVG, {
          status: 200,
          headers: { "Content-Type": "image/svg+xml" },
        });
      }),
    );
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sets data-tw-component=svg-loader on connect", async () => {
    const el = await mount({ src: "/ok.svg" });
    expect(el.getAttribute("data-tw-component")).toBe("svg-loader");
  });

  it("keeps data-tw-component fixed under a custom prefix tag", async () => {
    setPrefix("app");
    defineComponent("svg-loader", TwSvgLoader);
    const el = document.createElement("app-svg-loader") as TwSvgLoader;
    el.setAttribute("src", "/ok.svg");
    document.body.append(el);
    await Promise.resolve();
    await Promise.resolve();
    expect(el.getAttribute("data-tw-component")).toBe("svg-loader");
  });

  it("renders fetched svg into light DOM", async () => {
    const el = await mount({ src: "/ok.svg" });
    await vi.waitFor(() => {
      expect(el.querySelector("svg")).not.toBeNull();
    });
  });

  it("updates when src changes", async () => {
    const el = await mount({ src: "/ok.svg" });
    await vi.waitFor(() => expect(el.querySelector("circle")).not.toBeNull());
    el.setAttribute("src", "/svg-b.svg");
    await vi.waitFor(() => expect(el.querySelector("rect")).not.toBeNull());
  });

  it("refetches the same src without throwing", async () => {
    const el = await mount({ src: "/ok.svg" });
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    el.setAttribute("src", "/ok.svg");
    await vi.waitFor(() =>
      expect((fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(
        calls,
      ),
    );
    expect(el.querySelector("svg")).not.toBeNull();
  });

  it("stays empty when src is missing", async () => {
    const el = await mount();
    expect(el.querySelector("svg")).toBeNull();
    expect(el.querySelector(".svg-loader-placeholder")).toBeNull();
    expect(el.childNodes.length).toBe(0);
  });

  it("stays empty when src is empty string", async () => {
    const el = await mount({ src: "" });
    expect(el.querySelector("svg")).toBeNull();
    expect(el.querySelector(".svg-loader-placeholder")).toBeNull();
  });

  it("shows placeholder on network error", async () => {
    const el = await mount({ src: "/network-fail.svg" });
    await vi.waitFor(() =>
      expect(el.querySelector(".svg-loader-placeholder")).not.toBeNull(),
    );
    expect(el.querySelector("svg")).toBeNull();
  });

  it("shows placeholder on HTTP error", async () => {
    const el = await mount({ src: "/missing.svg" });
    await vi.waitFor(() =>
      expect(el.querySelector(".svg-loader-placeholder")).not.toBeNull(),
    );
  });

  it("shows placeholder for non-svg body", async () => {
    const el = await mount({ src: "/not-svg.txt" });
    await vi.waitFor(() =>
      expect(el.querySelector(".svg-loader-placeholder")).not.toBeNull(),
    );
    expect(el.querySelector("svg")).toBeNull();
  });

  it("applies width and height", async () => {
    const el = await mount({ src: "/ok.svg", width: "24", height: "24" });
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    expect(el.style.width).toBe("24px");
    expect(el.style.height).toBe("24px");
  });

  it("applies padding", async () => {
    const el = await mount({ src: "/ok.svg", padding: "4" });
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    expect(el.style.padding).toBe("4px");
  });

  it("applies stroke-width", async () => {
    const el = await mount({ src: "/ok.svg", "stroke-width": "2" });
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    const svg = el.querySelector("svg")!;
    expect(
      svg.getAttribute("stroke-width") === "2" || svg.style.strokeWidth === "2",
    ).toBe(true);
  });

  it("applies fill-color and stroke-color", async () => {
    const el = await mount({
      src: "/ok.svg",
      "fill-color": "#000000",
      "stroke-color": "#494949",
    });
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    const svg = el.querySelector("svg") as SVGElement;
    expect(svg.style.fill).toBe("#000000");
    expect(svg.style.stroke).toBe("#494949");
  });

  it("accepts CSS variables for fill-color", async () => {
    const el = await mount({
      src: "/ok.svg",
      "fill-color": "var(--tw-text-main)",
    });
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    expect((el.querySelector("svg") as SVGElement).style.fill).toBe(
      "var(--tw-text-main)",
    );
  });

  it("applies flip values", async () => {
    const el = await mount({ src: "/ok.svg", flip: "horizontal" });
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    expect(el.style.transform).toContain("scaleX(-1)");

    el.setAttribute("flip", "vertical");
    expect(el.style.transform).toContain("scaleY(-1)");

    el.setAttribute("flip", "both");
    expect(el.style.transform).toContain("scale(-1)");
  });

  it("applies rotate", async () => {
    const el = await mount({ src: "/ok.svg", rotate: "90" });
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    expect(el.style.transform).toContain("rotate(90deg)");
  });

  it("ignores invalid flip", async () => {
    const el = await mount({ src: "/ok.svg", flip: "diagonal" });
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    expect(el.style.transform).toBe("");
  });

  it("ignores invalid rotate", async () => {
    const el = await mount({ src: "/ok.svg", rotate: "abc" });
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    expect(el.style.transform).toBe("");
  });

  it("ignores invalid width", async () => {
    const el = await mount({ src: "/ok.svg", width: "-1" });
    await vi.waitFor(() => expect(el.querySelector("svg")).not.toBeNull());
    expect(el.style.width).toBe("");
  });
});
