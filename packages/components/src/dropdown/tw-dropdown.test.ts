import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwDropdown } from "./tw-dropdown.js";

function dropdownTag(): string {
  return `${getPrefix()}dropdown`;
}

function el(html: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.innerHTML = html.trim();
  return wrap.firstElementChild as HTMLElement;
}

function mountDropdown(
  attrs: Record<string, string> = {},
  children: Node[] = [],
): TwDropdown {
  const node = document.createElement(dropdownTag()) as TwDropdown;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === "") node.setAttribute(key, "");
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  document.body.append(node);
  return node;
}

function panelOf(dropdown: TwDropdown): HTMLElement {
  return dropdown.querySelector(".panel") as HTMLElement;
}

function triggerOf(dropdown: TwDropdown): HTMLElement {
  return dropdown.querySelector(".trigger") as HTMLElement;
}

describe("TwDropdown", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("dropdown", TwDropdown);
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  describe("data-tw-component", () => {
    it("sets data-tw-component=dropdown on connect", () => {
      const node = mountDropdown();
      expect(node.getAttribute("data-tw-component")).toBe("dropdown");
    });

    it("keeps data-tw-component=dropdown under a custom prefix", () => {
      setPrefix("app");
      defineComponent("dropdown", TwDropdown);
      const node = document.createElement("app-dropdown") as TwDropdown;
      document.body.append(node);
      expect(node.getAttribute("data-tw-component")).toBe("dropdown");
    });
  });

  describe("slot projection", () => {
    it("projects trigger and panel slots into wrappers", () => {
      const trigger = el(`<button slot="trigger">Open</button>`);
      const panel = el(`<div slot="panel">Menu</div>`);
      const node = mountDropdown({}, [trigger, panel]);
      expect(triggerOf(node).contains(trigger)).toBe(true);
      expect(panelOf(node).contains(panel)).toBe(true);
      expect(trigger.getAttribute("slot")).toBe("trigger");
      expect(panel.getAttribute("slot")).toBe("panel");
    });

    it("reprojects when slotted content is appended later", async () => {
      const node = mountDropdown();
      const trigger = el(`<button slot="trigger">Later</button>`);
      const panel = el(`<div slot="panel">Later panel</div>`);
      node.append(trigger, panel);
      await Promise.resolve();
      expect(triggerOf(node).contains(trigger)).toBe(true);
      expect(panelOf(node).contains(panel)).toBe(true);
    });

    it("connects without slots without throwing", () => {
      expect(() => mountDropdown()).not.toThrow();
      const node = mountDropdown();
      expect(triggerOf(node)).not.toBeNull();
      expect(panelOf(node)).not.toBeNull();
    });

    it("ignores unknown slots without throwing", () => {
      const foo = el(`<span slot="foo">x</span>`);
      expect(() => mountDropdown({}, [foo])).not.toThrow();
      const node = mountDropdown({}, [
        el(`<span slot="foo">x</span>`),
      ]);
      expect(triggerOf(node).querySelector('[slot="foo"]')).toBeNull();
      expect(panelOf(node).querySelector('[slot="foo"]')).toBeNull();
    });
  });

  describe("open / close / toggle", () => {
    it("starts closed with panel hidden", () => {
      const node = mountDropdown({}, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      expect(node.hasAttribute("open")).toBe(false);
      expect(panelOf(node).hasAttribute("hidden")).toBe(true);
    });

    it("open() sets open attribute and shows panel", () => {
      const node = mountDropdown({}, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      node.open();
      expect(node.hasAttribute("open")).toBe(true);
      expect(panelOf(node).hasAttribute("hidden")).toBe(false);
    });

    it("close() removes open attribute and hides panel", () => {
      const node = mountDropdown({ open: "" }, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      node.close();
      expect(node.hasAttribute("open")).toBe(false);
      expect(panelOf(node).hasAttribute("hidden")).toBe(true);
    });

    it("toggle() flips open state", () => {
      const node = mountDropdown({}, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      node.toggle();
      expect(node.hasAttribute("open")).toBe(true);
      node.toggle();
      expect(node.hasAttribute("open")).toBe(false);
    });

    it("starts open when open attribute is present on connect", () => {
      const node = mountDropdown({ open: "" }, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      expect(node.hasAttribute("open")).toBe(true);
      expect(panelOf(node).hasAttribute("hidden")).toBe(false);
    });

    it("open() / close() are idempotent", () => {
      const node = mountDropdown({}, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      expect(() => {
        node.open();
        node.open();
        node.close();
        node.close();
      }).not.toThrow();
      expect(node.hasAttribute("open")).toBe(false);
    });
  });

  describe("trigger click", () => {
    it("toggles on trigger click", () => {
      const node = mountDropdown({}, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      triggerOf(node).querySelector("button")!.click();
      expect(node.hasAttribute("open")).toBe(true);
      triggerOf(node).querySelector("button")!.click();
      expect(node.hasAttribute("open")).toBe(false);
    });

    it("does not close from panel click alone", () => {
      const node = mountDropdown({ open: "" }, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel"><button type="button">Item</button></div>`),
      ]);
      panelOf(node).querySelector("button")!.click();
      expect(node.hasAttribute("open")).toBe(true);
    });
  });

  describe("outside click", () => {
    it("closes when clicking outside the host while open", () => {
      const node = mountDropdown({ open: "" }, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      const outside = document.createElement("button");
      document.body.append(outside);
      outside.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, composed: true }),
      );
      expect(node.hasAttribute("open")).toBe(false);
    });

    it("stays open when clicking panel while open", () => {
      const node = mountDropdown({ open: "" }, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel"><span>inside</span></div>`),
      ]);
      panelOf(node)
        .querySelector("span")!
        .dispatchEvent(
          new PointerEvent("pointerdown", { bubbles: true, composed: true }),
        );
      expect(node.hasAttribute("open")).toBe(true);
    });

    it("does nothing on outside click while closed", () => {
      const node = mountDropdown({}, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      const outside = document.createElement("button");
      document.body.append(outside);
      outside.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, composed: true }),
      );
      expect(node.hasAttribute("open")).toBe(false);
    });
  });

  describe("Escape", () => {
    it("closes on Escape while open", () => {
      const node = mountDropdown({ open: "" }, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      expect(node.hasAttribute("open")).toBe(false);
    });

    it("ignores Escape while closed", () => {
      const node = mountDropdown({}, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      expect(() => {
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      }).not.toThrow();
      expect(node.hasAttribute("open")).toBe(false);
    });
  });

  describe("placement", () => {
    it("defaults to bottom-start", () => {
      const node = mountDropdown({}, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      expect(node.getPlacement()).toBe("bottom-start");
    });

    it("accepts top-end", () => {
      const node = mountDropdown({ placement: "top-end" }, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      expect(node.getPlacement()).toBe("top-end");
    });

    it("falls back invalid placement to bottom-start", () => {
      const node = mountDropdown({ placement: "nope" }, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      expect(node.getPlacement()).toBe("bottom-start");
    });

    it("repositions without throwing when placement changes while open", () => {
      const node = mountDropdown({ open: "" }, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      expect(() => node.setAttribute("placement", "top-start")).not.toThrow();
      expect(node.getPlacement()).toBe("top-start");
    });
  });

  describe("Floating UI behavior", () => {
    it("applies position styles after open()", async () => {
      const node = mountDropdown({}, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      node.open();
      await vi.waitFor(() => {
        const panel = panelOf(node);
        expect(panel.style.position).toBeTruthy();
        expect(panel.style.left).toMatch(/px$/);
        expect(panel.style.top).toMatch(/px$/);
      });
    });

    it("stops updating after close without throwing", async () => {
      const node = mountDropdown({ open: "" }, [
        el(`<button slot="trigger">T</button>`),
        el(`<div slot="panel">P</div>`),
      ]);
      await Promise.resolve();
      expect(() => {
        node.close();
        node.close();
        node.remove();
      }).not.toThrow();
    });

    it("open() with empty trigger/panel does not throw", () => {
      const node = mountDropdown();
      expect(() => node.open()).not.toThrow();
      expect(node.hasAttribute("open")).toBe(true);
    });
  });
});
