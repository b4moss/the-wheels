import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwDropdown } from "../dropdown/tw-dropdown.js";
import { TwSvgLoader } from "../svg_loader/tw-svg-loader.js";
import { MORE_VERTICAL_SRC, TwActionMenu } from "./tw-action-menu.js";

function actionMenuTag(): string {
  return `${getPrefix()}action-menu`;
}

function dropdownTag(): string {
  return `${getPrefix()}dropdown`;
}

function el(html: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.innerHTML = html.trim();
  return wrap.firstElementChild as HTMLElement;
}

function mountActionMenu(
  attrs: Record<string, string> = {},
  children: Node[] = [],
): TwActionMenu {
  const node = document.createElement(actionMenuTag()) as TwActionMenu;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === "") node.setAttribute(key, "");
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  document.body.append(node);
  return node;
}

describe("TwActionMenu", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("svg-loader", TwSvgLoader);
    defineComponent("dropdown", TwDropdown);
    defineComponent("action-menu", TwActionMenu);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/></svg>',
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

  it("sets data-tw-component=action-menu on connect", () => {
    const node = mountActionMenu();
    expect(node.getAttribute("data-tw-component")).toBe("action-menu");
  });

  describe("Dropdown composition", () => {
    it("creates an internal Dropdown host", () => {
      const node = mountActionMenu();
      const dropdown = node.querySelector(dropdownTag());
      expect(dropdown).not.toBeNull();
      expect(dropdown).toBe(node.getDropdown());
    });

    it("delegates open / close / toggle to the internal Dropdown", () => {
      const node = mountActionMenu({}, [
        el(`<button type="button">Edit</button>`),
      ]);
      const dropdown = node.getDropdown()!;

      node.open();
      expect(node.hasAttribute("open")).toBe(true);
      expect(dropdown.hasAttribute("open")).toBe(true);

      node.close();
      expect(node.hasAttribute("open")).toBe(false);
      expect(dropdown.hasAttribute("open")).toBe(false);

      node.toggle();
      expect(dropdown.hasAttribute("open")).toBe(true);
      node.toggle();
      expect(dropdown.hasAttribute("open")).toBe(false);
    });
  });

  describe("default trigger icon", () => {
    it("renders a plain button trigger with MORE_VERTICAL_SRC", () => {
      const node = mountActionMenu();
      const button = node.querySelector("button.action-menu-trigger");
      expect(button).not.toBeNull();
      expect((button as HTMLButtonElement).type).toBe("button");

      const icon = button!.querySelector(`${getPrefix()}svg-loader`);
      expect(icon).not.toBeNull();
      expect(icon!.getAttribute("src")).toBe(MORE_VERTICAL_SRC);
    });
  });

  describe("src attribute", () => {
    it("forwards src to the default SVGLoader", () => {
      const src = "https://example.com/icon.svg";
      const node = mountActionMenu({ src });
      const icon = node.querySelector(
        `button.action-menu-trigger ${getPrefix()}svg-loader`,
      );
      expect(icon!.getAttribute("src")).toBe(src);
    });

    it("updates SVGLoader when src changes later", () => {
      const node = mountActionMenu();
      const next = "https://example.com/other.svg";
      node.setAttribute("src", next);
      const icon = node.querySelector(
        `button.action-menu-trigger ${getPrefix()}svg-loader`,
      );
      expect(icon!.getAttribute("src")).toBe(next);
    });

    it("keeps default URL when src is empty", () => {
      const node = mountActionMenu({ src: "" });
      const icon = node.querySelector(
        `button.action-menu-trigger ${getPrefix()}svg-loader`,
      );
      expect(icon!.getAttribute("src")).toBe(MORE_VERTICAL_SRC);
    });
  });

  describe("custom trigger slot", () => {
    it("uses custom trigger instead of default more-vertical button", () => {
      const custom = el(`<button type="button" slot="trigger">Custom</button>`);
      const node = mountActionMenu({ src: "https://example.com/ignored.svg" }, [
        custom,
      ]);
      expect(node.querySelector("button.action-menu-trigger")).toBeNull();
      expect(node.querySelector(`${dropdownTag()} [slot="trigger"]`)).toBe(
        custom,
      );
      expect(custom.textContent).toBe("Custom");
    });

    it("opens on custom trigger click", () => {
      const custom = el(`<button type="button" slot="trigger">Custom</button>`);
      const node = mountActionMenu({}, [
        custom,
        el(`<button type="button">Item</button>`),
      ]);
      custom.click();
      expect(node.getDropdown()!.hasAttribute("open")).toBe(true);
    });
  });

  describe("menu items and auto-close", () => {
    it("projects default slot content into the dropdown panel", () => {
      const item = el(`<button type="button">Edit</button>`);
      const node = mountActionMenu({}, [item]);
      const panel = node.querySelector(`${dropdownTag()} .panel`);
      expect(panel!.contains(item)).toBe(true);
    });

    it("closes when clicking an item inside the panel", () => {
      const item = el(`<button type="button">Delete</button>`);
      const node = mountActionMenu({}, [item]);
      node.open();
      expect(node.getDropdown()!.hasAttribute("open")).toBe(true);
      item.click();
      expect(node.getDropdown()!.hasAttribute("open")).toBe(false);
      expect(node.hasAttribute("open")).toBe(false);
    });

    it("closes on outside click via Dropdown", () => {
      const node = mountActionMenu({}, [
        el(`<button type="button">Edit</button>`),
      ]);
      node.open();
      const outside = document.createElement("button");
      document.body.append(outside);
      outside.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, composed: true }),
      );
      expect(node.getDropdown()!.hasAttribute("open")).toBe(false);
    });

    it("opens empty panel without throwing", () => {
      const node = mountActionMenu();
      expect(() => node.open()).not.toThrow();
    });
  });

  describe("placement forwarding", () => {
    it("forwards placement to the internal Dropdown", () => {
      const node = mountActionMenu({ placement: "top-start" });
      expect(node.getDropdown()!.getAttribute("placement")).toBe("top-start");
      expect(node.getDropdown()!.getPlacement()).toBe("top-start");
    });

    it("defaults internal placement to bottom-start", () => {
      const node = mountActionMenu();
      expect(node.getDropdown()!.getPlacement()).toBe("bottom-start");
    });

    it("falls back invalid placement via Dropdown", () => {
      const node = mountActionMenu({ placement: "diagonal" });
      expect(node.getDropdown()!.getPlacement()).toBe("bottom-start");
    });
  });
});
