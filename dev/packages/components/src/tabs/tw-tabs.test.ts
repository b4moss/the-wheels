import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEventName, getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwTabs } from "./tw-tabs.js";

function tabsTag(): string {
  return `${getPrefix()}tabs`;
}

function mountTabs(html: string): TwTabs {
  const el = document.createElement(tabsTag()) as TwTabs;
  el.innerHTML = html;
  document.body.append(el);
  return el;
}

describe("TwTabs", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("tabs", TwTabs);
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it("sets data-tw-component=tabs on connect", () => {
    const el = mountTabs(`
      <button type="button" slot="tab">One</button>
      <div slot="panel">A</div>
    `);
    expect(el.getAttribute("data-tw-component")).toBe("tabs");
  });

  it("shows the first panel by default and hides others", () => {
    const el = mountTabs(`
      <button type="button" slot="tab">One</button>
      <button type="button" slot="tab">Two</button>
      <div slot="panel">Panel A</div>
      <div slot="panel">Panel B</div>
    `);

    const panels = el.querySelectorAll("[role='tabpanel']");
    expect(panels).toHaveLength(2);
    expect(panels[0]!.hasAttribute("hidden")).toBe(false);
    expect(panels[1]!.hasAttribute("hidden")).toBe(true);
    expect(el.selectedIndex).toBe(0);

    const tabs = el.querySelectorAll("[data-tw-tab]");
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("false");
  });

  it("switches the visible panel on tab click", () => {
    const el = mountTabs(`
      <button type="button" slot="tab">One</button>
      <button type="button" slot="tab">Two</button>
      <div slot="panel">Panel A</div>
      <div slot="panel">Panel B</div>
    `);

    const tabs = el.querySelectorAll<HTMLButtonElement>("[data-tw-tab]");
    tabs[1]!.click();

    const panels = el.querySelectorAll("[role='tabpanel']");
    expect(el.selectedIndex).toBe(1);
    expect(panels[0]!.hasAttribute("hidden")).toBe(true);
    expect(panels[1]!.hasAttribute("hidden")).toBe(false);
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");
  });

  it("select() updates selected-index and visible panel", () => {
    const el = mountTabs(`
      <button type="button" slot="tab">One</button>
      <button type="button" slot="tab">Two</button>
      <button type="button" slot="tab">Three</button>
      <div slot="panel">A</div>
      <div slot="panel">B</div>
      <div slot="panel">C</div>
    `);

    el.select(2);
    expect(el.selectedIndex).toBe(2);
    expect(el.getAttribute("selected-index")).toBe("2");

    const panels = el.querySelectorAll("[role='tabpanel']");
    expect(panels[2]!.hasAttribute("hidden")).toBe(false);
    expect(panels[0]!.hasAttribute("hidden")).toBe(true);
  });

  it("honors selected-index attribute on connect", () => {
    const el = document.createElement(tabsTag()) as TwTabs;
    el.setAttribute("selected-index", "1");
    el.innerHTML = `
      <button type="button" slot="tab">One</button>
      <button type="button" slot="tab">Two</button>
      <div slot="panel">A</div>
      <div slot="panel">B</div>
    `;
    document.body.append(el);

    expect(el.selectedIndex).toBe(1);
    const panels = el.querySelectorAll("[role='tabpanel']");
    expect(panels[1]!.hasAttribute("hidden")).toBe(false);
  });

  it("moves focus with arrow keys", () => {
    const el = mountTabs(`
      <button type="button" slot="tab">One</button>
      <button type="button" slot="tab">Two</button>
      <div slot="panel">A</div>
      <div slot="panel">B</div>
    `);

    const tabs = el.querySelectorAll<HTMLButtonElement>("[data-tw-tab]");
    tabs[0]!.focus();
    tabs[0]!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    expect(el.selectedIndex).toBe(1);
    expect(document.activeElement).toBe(tabs[1]);
  });

  it("emits change with selectedIndex on click and select", () => {
    const el = mountTabs(`
      <button type="button" slot="tab">One</button>
      <button type="button" slot="tab">Two</button>
      <div slot="panel">A</div>
      <div slot="panel">B</div>
    `);
    const spy = vi.fn();
    el.addEventListener(getEventName("change"), spy);
    el.querySelectorAll<HTMLButtonElement>("[data-tw-tab]")[1]!.click();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]![0].detail.selectedIndex).toBe(1);

    spy.mockClear();
    el.select(0);
    expect(spy.mock.calls[0]![0].detail.selectedIndex).toBe(0);

    spy.mockClear();
    el.select(0);
    expect(spy).not.toHaveBeenCalled();
  });
});
