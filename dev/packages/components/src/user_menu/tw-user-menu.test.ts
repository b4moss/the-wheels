import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwDropdown } from "../dropdown/tw-dropdown.js";
import { TwActionMenu } from "../action_menu/tw-action-menu.js";
import { TwUserMenu } from "./tw-user-menu.js";

function userMenuTag(): string {
  return `${getPrefix()}user-menu`;
}

function dropdownTag(): string {
  return `${getPrefix()}dropdown`;
}

function actionMenuTag(): string {
  return `${getPrefix()}action-menu`;
}

function el(html: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.innerHTML = html.trim();
  return wrap.firstElementChild as HTMLElement;
}

function mountUserMenu(
  attrs: Record<string, string> = {},
  children: Node[] = [],
): TwUserMenu {
  const node = document.createElement(userMenuTag()) as TwUserMenu;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === "") node.setAttribute(key, "");
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  document.body.append(node);
  return node;
}

describe("TwUserMenu", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("dropdown", TwDropdown);
    defineComponent("action-menu", TwActionMenu);
    defineComponent("user-menu", TwUserMenu);
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it("sets data-tw-component=user-menu on connect", () => {
    const node = mountUserMenu({}, [
      el(`<button type="button" slot="trigger">Me</button>`),
    ]);
    expect(node.getAttribute("data-tw-component")).toBe("user-menu");
  });

  it("keeps data-tw-component=user-menu under a custom prefix", () => {
    setPrefix("app");
    defineComponent("dropdown", TwDropdown);
    defineComponent("user-menu", TwUserMenu);
    const node = document.createElement("app-user-menu") as TwUserMenu;
    node.append(el(`<button type="button" slot="trigger">Me</button>`));
    document.body.append(node);
    expect(node.getAttribute("data-tw-component")).toBe("user-menu");
    expect(node.querySelector("app-dropdown")).not.toBeNull();
  });

  describe("Dropdown composition (not ActionMenu)", () => {
    it("creates an internal Dropdown and no ActionMenu host", () => {
      const node = mountUserMenu({}, [
        el(`<button type="button" slot="trigger">Me</button>`),
      ]);
      expect(node.querySelector(dropdownTag())).not.toBeNull();
      expect(node.querySelector(actionMenuTag())).toBeNull();
      expect(node.getDropdown()).toBe(node.querySelector(dropdownTag()));
    });

    it("delegates open / close / toggle and open attribute", () => {
      const node = mountUserMenu({}, [
        el(`<button type="button" slot="trigger">Me</button>`),
        el(`<a data-tw-user-menu-item href="/profile">Profile</a>`),
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

    it("open() while already open stays open without throwing", () => {
      const node = mountUserMenu({}, [
        el(`<button type="button" slot="trigger">Me</button>`),
      ]);
      node.open();
      expect(() => node.open()).not.toThrow();
      expect(node.getDropdown()!.hasAttribute("open")).toBe(true);
    });
  });

  describe("trigger slot (required)", () => {
    it("projects slot=trigger into the dropdown trigger region", () => {
      const trigger = el(
        `<button type="button" slot="trigger"><span>山田</span></button>`,
      );
      const node = mountUserMenu({}, [trigger]);
      expect(node.querySelector(`${dropdownTag()} [slot="trigger"]`)).toBe(
        trigger,
      );
      expect(trigger.textContent).toContain("山田");
    });

    it("toggles on trigger click", () => {
      const trigger = el(`<button type="button" slot="trigger">Me</button>`);
      const node = mountUserMenu({}, [
        trigger,
        el(`<a data-tw-user-menu-item href="/a">A</a>`),
      ]);
      trigger.click();
      expect(node.getDropdown()!.hasAttribute("open")).toBe(true);
      trigger.click();
      expect(node.getDropdown()!.hasAttribute("open")).toBe(false);
    });

    it("does not create a default trigger when slot is missing", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const node = mountUserMenu();
      await Promise.resolve();
      expect(node.querySelector(`${dropdownTag()} [slot="trigger"]`)).toBeNull();
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it("ignores unknown named slots without throwing", () => {
      expect(() =>
        mountUserMenu({}, [
          el(`<button type="button" slot="foo">Ignored</button>`),
          el(`<button type="button" slot="trigger">Me</button>`),
        ]),
      ).not.toThrow();
      const node = document.querySelector(userMenuTag()) as TwUserMenu;
      expect(node.querySelector('[slot="foo"]')).not.toBeNull();
      // foo stays as host sibling / unprojected named slot — not as trigger of dropdown
      expect(
        node.querySelector(`${dropdownTag()} [slot="trigger"]`)?.textContent,
      ).toBe("Me");
    });
  });

  describe("menu items and auto-close", () => {
    it("projects default slot into the panel", () => {
      const item = el(`<a data-tw-user-menu-item href="/profile">Profile</a>`);
      const node = mountUserMenu({}, [
        el(`<button type="button" slot="trigger">Me</button>`),
        item,
      ]);
      const panel = node.querySelector(`${dropdownTag()} .panel`);
      expect(panel!.contains(item)).toBe(true);
    });

    it("closes when clicking an item inside the panel", () => {
      const item = el(`<button type="button" data-tw-user-menu-item>Logout</button>`);
      const node = mountUserMenu({}, [
        el(`<button type="button" slot="trigger">Me</button>`),
        item,
      ]);
      node.open();
      item.click();
      expect(node.getDropdown()!.hasAttribute("open")).toBe(false);
      expect(node.hasAttribute("open")).toBe(false);
    });

    it("opens empty panel without throwing", () => {
      const node = mountUserMenu({}, [
        el(`<button type="button" slot="trigger">Me</button>`),
      ]);
      expect(() => node.open()).not.toThrow();
    });

    it("closes on outside click via Dropdown", () => {
      const node = mountUserMenu({}, [
        el(`<button type="button" slot="trigger">Me</button>`),
        el(`<a data-tw-user-menu-item href="/a">A</a>`),
      ]);
      node.open();
      const outside = document.createElement("button");
      document.body.append(outside);
      outside.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, composed: true }),
      );
      expect(node.getDropdown()!.hasAttribute("open")).toBe(false);
    });
  });

  describe("Escape / placement", () => {
    it("closes on Escape when open", () => {
      const node = mountUserMenu({}, [
        el(`<button type="button" slot="trigger">Me</button>`),
      ]);
      node.open();
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      expect(node.getDropdown()!.hasAttribute("open")).toBe(false);
    });

    it("does nothing on Escape when closed", () => {
      const node = mountUserMenu({}, [
        el(`<button type="button" slot="trigger">Me</button>`),
      ]);
      expect(() =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        ),
      ).not.toThrow();
      expect(node.getDropdown()!.hasAttribute("open")).toBe(false);
    });

    it("forwards placement=top-end to internal Dropdown", () => {
      const node = mountUserMenu(
        { placement: "top-end" },
        [el(`<button type="button" slot="trigger">Me</button>`)],
      );
      expect(node.getDropdown()!.getAttribute("placement")).toBe("top-end");
      expect(node.getDropdown()!.getPlacement()).toBe("top-end");
    });

    it("defaults internal placement to bottom-start", () => {
      const node = mountUserMenu({}, [
        el(`<button type="button" slot="trigger">Me</button>`),
      ]);
      expect(node.getDropdown()!.getPlacement()).toBe("bottom-start");
    });

    it("falls back invalid placement to bottom-start", () => {
      const node = mountUserMenu(
        { placement: "diagonal" },
        [el(`<button type="button" slot="trigger">Me</button>`)],
      );
      expect(node.getDropdown()!.getPlacement()).toBe("bottom-start");
    });
  });

  describe("no host Avatar attributes", () => {
    it("does not auto-create an Avatar from name / image-path", () => {
      const node = mountUserMenu(
        { name: "山田太郎", "image-path": "https://example.com/a.png" },
        [el(`<button type="button" slot="trigger">Me</button>`)],
      );
      expect(node.querySelector(`${getPrefix()}avatar`)).toBeNull();
      expect(node.querySelector(".avatar")).toBeNull();
    });
  });
});
