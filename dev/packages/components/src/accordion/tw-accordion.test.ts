import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwSvgLoader } from "../svg_loader/tw-svg-loader.js";
import { CHEVRON_SRC, TwAccordion } from "./tw-accordion.js";
import { ensureAccordionGroupDelegation } from "./accordion-group.js";

function accordionTag(): string {
  return `${getPrefix()}accordion`;
}

function el(html: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.innerHTML = html.trim();
  return wrap.firstElementChild as HTMLElement;
}

function mountAccordion(
  attrs: Record<string, string> = {},
  children: Node[] = [],
): TwAccordion {
  const node = document.createElement(accordionTag()) as TwAccordion;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === "") node.setAttribute(key, "");
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  document.body.append(node);
  return node;
}

function chevron(node: TwAccordion): HTMLElement | null {
  return node.querySelector(`${getPrefix()}svg-loader`);
}

describe("TwAccordion", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("svg-loader", TwSvgLoader);
    defineComponent("accordion", TwAccordion);
    ensureAccordionGroupDelegation();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
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

  describe("data-tw-component", () => {
    it("sets data-tw-component=accordion on connect", () => {
      const node = mountAccordion();
      expect(node.getAttribute("data-tw-component")).toBe("accordion");
    });

    it("keeps data-tw-component=accordion when registered as app-accordion", () => {
      setPrefix("app");
      defineComponent("accordion", TwAccordion);
      const node = document.createElement("app-accordion") as TwAccordion;
      document.body.append(node);
      expect(node.getAttribute("data-tw-component")).toBe("accordion");
    });
  });

  describe("internal details / summary", () => {
    it("renders exactly one details with a summary", () => {
      const node = mountAccordion();
      const detailsList = node.querySelectorAll("details");
      expect(detailsList).toHaveLength(1);
      expect(detailsList[0].querySelector("summary")).not.toBeNull();
    });

    it("does not throw when slots are empty", () => {
      expect(() => mountAccordion()).not.toThrow();
    });
  });

  describe("slot projection", () => {
    it("projects header into summary and content into details body", () => {
      const node = mountAccordion({}, [
        el(`<span slot="header">Title</span>`),
        el(`<p slot="content">Body</p>`),
      ]);
      const summary = node.querySelector("summary")!;
      const details = node.querySelector("details")!;
      expect(summary.textContent).toContain("Title");
      expect(details.querySelector("p")?.textContent).toBe("Body");
      expect(summary.contains(details.querySelector("p")!)).toBe(false);
    });

    it("ignores unknown named slots", () => {
      const node = mountAccordion({}, [
        el(`<span slot="foo">Nope</span>`),
      ]);
      expect(node.querySelector("summary")?.textContent).not.toContain("Nope");
      expect(node.querySelector("details")?.textContent).not.toContain("Nope");
    });

    it("does not project bare default text into header/content", () => {
      const node = document.createElement(accordionTag()) as TwAccordion;
      node.append(document.createTextNode("orphan text"));
      document.body.append(node);
      const summary = node.querySelector("summary")!;
      const body = node.querySelector(".accordion-content");
      expect(summary.textContent).not.toContain("orphan text");
      expect(body?.textContent ?? "").not.toContain("orphan text");
    });
  });

  describe("open / close and open attribute", () => {
    it("starts closed", () => {
      const node = mountAccordion();
      expect(node.hasAttribute("open")).toBe(false);
      expect(node.querySelector("details")?.open).toBe(false);
    });

    it("open() sets host open and details.open", () => {
      const node = mountAccordion();
      node.open();
      expect(node.hasAttribute("open")).toBe(true);
      expect(node.querySelector("details")?.open).toBe(true);
    });

    it("close() clears host open and details.open", () => {
      const node = mountAccordion({ open: "" });
      node.close();
      expect(node.hasAttribute("open")).toBe(false);
      expect(node.querySelector("details")?.open).toBe(false);
    });

    it("starts open when open attribute is present at connect", () => {
      const node = mountAccordion({ open: "" });
      expect(node.hasAttribute("open")).toBe(true);
      expect(node.querySelector("details")?.open).toBe(true);
    });

    it("syncs host open when details toggles closed", () => {
      const node = mountAccordion();
      node.open();
      const details = node.querySelector("details")!;
      details.open = false;
      details.dispatchEvent(new Event("toggle"));
      expect(node.hasAttribute("open")).toBe(false);
    });

    it("syncs host open when details toggles open", () => {
      const node = mountAccordion();
      const details = node.querySelector("details")!;
      details.open = true;
      details.dispatchEvent(new Event("toggle"));
      expect(node.hasAttribute("open")).toBe(true);
    });

    it("open() when already open stays open", () => {
      const node = mountAccordion();
      node.open();
      expect(() => node.open()).not.toThrow();
      expect(node.hasAttribute("open")).toBe(true);
    });

    it("close() when already closed stays closed", () => {
      const node = mountAccordion();
      expect(() => node.close()).not.toThrow();
      expect(node.hasAttribute("open")).toBe(false);
    });
  });

  describe("chevron indicator", () => {
    it("renders chevron with rotate 0 when closed", () => {
      const node = mountAccordion();
      const icon = chevron(node);
      expect(icon).not.toBeNull();
      expect(icon!.getAttribute("src")).toBe(CHEVRON_SRC);
      const rotate = icon!.getAttribute("rotate");
      expect(rotate == null || rotate === "0").toBe(true);
    });

    it("sets rotate 180 after open()", () => {
      const node = mountAccordion();
      node.open();
      expect(chevron(node)!.getAttribute("rotate")).toBe("180");
    });

    it("resets rotate to 0 after close()", () => {
      const node = mountAccordion();
      node.open();
      node.close();
      expect(chevron(node)!.getAttribute("rotate")).toBe("0");
    });
  });

  describe("group integration", () => {
    it("opens/closes same group via delegation buttons", () => {
      const a = mountAccordion({ "data-tw-accordion-group": "faq" }, [
        el(`<span slot="header">A</span>`),
      ]);
      const b = mountAccordion({ "data-tw-accordion-group": "faq" }, [
        el(`<span slot="header">B</span>`),
      ]);
      const other = mountAccordion({ "data-tw-accordion-group": "other" });

      const openBtn = document.createElement("button");
      openBtn.setAttribute("data-tw-accordion-open", "faq");
      document.body.append(openBtn);
      openBtn.click();

      expect(a.hasAttribute("open")).toBe(true);
      expect(b.hasAttribute("open")).toBe(true);
      expect(other.hasAttribute("open")).toBe(false);

      const closeBtn = document.createElement("button");
      closeBtn.setAttribute("data-tw-accordion-close", "faq");
      document.body.append(closeBtn);
      closeBtn.click();

      expect(a.hasAttribute("open")).toBe(false);
      expect(b.hasAttribute("open")).toBe(false);
    });

    it("excludes hosts without data-tw-accordion-group", () => {
      const grouped = mountAccordion({ "data-tw-accordion-group": "faq" });
      const ungrouped = mountAccordion();

      const openBtn = document.createElement("button");
      openBtn.setAttribute("data-tw-accordion-open", "faq");
      document.body.append(openBtn);
      openBtn.click();

      expect(grouped.hasAttribute("open")).toBe(true);
      expect(ungrouped.hasAttribute("open")).toBe(false);
    });
  });

  describe("multiple panels open", () => {
    it("allows A and B open at the same time", () => {
      const a = mountAccordion();
      const b = mountAccordion();
      a.open();
      b.open();
      expect(a.hasAttribute("open")).toBe(true);
      expect(b.hasAttribute("open")).toBe(true);
    });
  });
});
