import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwSpinner } from "../spinner/tw-spinner.js";
import { TwSvgLoader } from "../svg_loader/tw-svg-loader.js";
import { TwButton } from "./tw-button.js";
import { TwDropdown } from "../dropdown/tw-dropdown.js";
import { TwActionMenu } from "../action_menu/tw-action-menu.js";

describe("TwButton reconnect projection", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("svg-loader", TwSvgLoader);
    defineComponent("spinner", TwSpinner);
    defineComponent("button", TwButton);
    defineComponent("dropdown", TwDropdown);
    defineComponent("action-menu", TwActionMenu);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24"/></svg>',
          { status: 200, headers: { "Content-Type": "image/svg+xml" } },
        ),
      ),
    );
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it("keeps label after move into dropdown trigger", () => {
    const dropdown = document.createElement("tw-dropdown");
    const btn = document.createElement("tw-button");
    btn.setAttribute("slot", "trigger");
    btn.textContent = "アカウント";
    const panel = document.createElement("div");
    panel.setAttribute("slot", "panel");
    panel.innerHTML = '<button type="button">プロフィール</button>';
    dropdown.append(btn, panel);
    document.body.append(dropdown);

    expect(btn.querySelector(".button-label")?.textContent).toBe("アカウント");
    expect(dropdown.querySelector(".trigger")?.contains(btn)).toBe(true);
  });

  it("keeps label after action-menu custom trigger projection", async () => {
    const menu = document.createElement("tw-action-menu");
    const btn = document.createElement("tw-button");
    btn.setAttribute("slot", "trigger");
    btn.setAttribute("variant", "stroke");
    btn.textContent = "操作";
    const item = document.createElement("button");
    item.type = "button";
    item.textContent = "共有";
    menu.append(btn, item);
    document.body.append(menu);
    await Promise.resolve();

    expect(btn.querySelector(".button-label")?.textContent).toBe("操作");
    expect(menu.querySelector(".action-menu-panel")?.textContent).toContain(
      "共有",
    );
    expect(menu.querySelector(".action-menu-trigger")).toBeNull();
  });

  it("keeps label when button is reparented", () => {
    const btn = document.createElement(
      "tw-button",
    ) as InstanceType<typeof TwButton>;
    btn.textContent = "Save";
    document.body.append(btn);
    expect(btn.querySelector(".button-label")!.textContent).toBe("Save");
    const wrap = document.createElement("div");
    document.body.append(wrap);
    wrap.append(btn);
    expect(btn.querySelector(".button-label")!.textContent).toBe("Save");
  });

  it("projects children that arrive after connect", async () => {
    const btn = document.createElement("tw-button");
    document.body.append(btn);
    expect(btn.querySelector(".button-label")!.textContent).toBe("");
    btn.append(document.createTextNode("Later"));
    await Promise.resolve();
    expect(btn.querySelector(".button-label")!.textContent).toBe("Later");
  });

  it("keeps composed labels when markup is parsed via innerHTML", async () => {
    document.body.innerHTML = `
      <tw-dropdown>
        <tw-button slot="trigger">アカウント</tw-button>
        <div slot="panel"><button type="button">プロフィール</button></div>
      </tw-dropdown>
      <tw-action-menu>
        <tw-button slot="trigger" variant="stroke">操作</tw-button>
        <button type="button">共有</button>
      </tw-action-menu>
    `;
    await Promise.resolve();
    await Promise.resolve();

    const labels = Array.from(document.querySelectorAll(".button-label")).map(
      (el) => el.textContent,
    );
    expect(labels).toContain("アカウント");
    expect(labels).toContain("操作");
    expect(
      document.querySelector("tw-action-menu .action-menu-panel")?.textContent,
    ).toContain("共有");
    expect(
      document.querySelector("tw-action-menu .action-menu-trigger"),
    ).toBeNull();
  });
});
