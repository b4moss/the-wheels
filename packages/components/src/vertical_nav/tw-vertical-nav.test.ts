import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "./tw-vertical-nav.js";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body.firstElementChild as HTMLElement;
}

describe("TwVerticalNav", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("sets data-tw-component", () => {
    const el = mount(`<tw-vertical-nav><a href="/">Home</a></tw-vertical-nav>`);
    expect(el.getAttribute("data-tw-component")).toBe("vertical-nav");
  });

  it("keeps the provided interactive element and does not add its own", () => {
    const el = mount(
      `<tw-vertical-nav><a href="/home">Home</a></tw-vertical-nav>`,
    );
    const links = el.querySelectorAll("a");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("/home");
  });

  it("supports button children", () => {
    const el = mount(
      `<tw-vertical-nav><button type="button">Go</button></tw-vertical-nav>`,
    );
    expect(el.querySelector("button")?.textContent).toBe("Go");
  });

  it("allows empty content without throwing", () => {
    expect(() => mount(`<tw-vertical-nav></tw-vertical-nav>`)).not.toThrow();
  });

  it("syncs aria-current=page to data-tw-nav-current", async () => {
    const el = mount(
      `<tw-vertical-nav><a href="/" aria-current="page">Home</a></tw-vertical-nav>`,
    );
    await Promise.resolve();
    expect(el.hasAttribute("data-tw-nav-current")).toBe(true);
  });

  it("does not set data-tw-nav-current without aria-current=page", async () => {
    const el = mount(`<tw-vertical-nav><a href="/">Home</a></tw-vertical-nav>`);
    await Promise.resolve();
    expect(el.hasAttribute("data-tw-nav-current")).toBe(false);
  });

  it("updates when aria-current changes", async () => {
    const el = mount(`<tw-vertical-nav><a href="/">Home</a></tw-vertical-nav>`);
    const link = el.querySelector("a")!;
    link.setAttribute("aria-current", "page");
    await Promise.resolve();
    expect(el.hasAttribute("data-tw-nav-current")).toBe(true);

    link.removeAttribute("aria-current");
    await Promise.resolve();
    expect(el.hasAttribute("data-tw-nav-current")).toBe(false);
  });

  it("ignores non-page aria-current values", () => {
    const el = mount(
      `<tw-vertical-nav><a href="/" aria-current="true">Home</a></tw-vertical-nav>`,
    );
    expect(el.hasAttribute("data-tw-nav-current")).toBe(false);
  });

  it("resyncs when the interactive child is replaced", async () => {
    const el = mount(
      `<tw-vertical-nav><a href="/a">A</a></tw-vertical-nav>`,
    );
    el.replaceChildren();
    const next = document.createElement("a");
    next.href = "/b";
    next.setAttribute("aria-current", "page");
    next.textContent = "B";
    el.append(next);
    await Promise.resolve();
    expect(el.hasAttribute("data-tw-nav-current")).toBe(true);
  });
});
