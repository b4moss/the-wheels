import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwExpandable } from "./tw-expandable.js";

function tag(): string {
  return `${getPrefix()}expandable`;
}

async function mount(html = "内容"): Promise<TwExpandable> {
  const el = document.createElement(tag()) as TwExpandable;
  el.textContent = html;
  document.body.append(el);
  await Promise.resolve();
  return el;
}

describe("TwExpandable", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("expandable", TwExpandable);
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it("sets data-tw-component and starts collapsed with slot content in DOM", async () => {
    const el = await mount("利用規約本文");
    expect(el.getAttribute("data-tw-component")).toBe("expandable");
    expect(el.open).toBe(false);
    expect(el.textContent).toContain("利用規約本文");
    const body = el.querySelector(".expandable-body") as HTMLElement;
    expect(body.style.maxHeight).toBeTruthy();
  });

  it("toggles open state and button label", async () => {
    const el = await mount();
    const button = el.querySelector(".expandable-toggle") as HTMLButtonElement;
    expect(button.textContent).toContain("もっと見る");
    button.click();
    expect(el.open).toBe(true);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.textContent).toContain("閉じる");
    button.click();
    expect(el.open).toBe(false);
  });

  it("respects expand-label / collapse-label overrides", async () => {
    const el = await mount();
    el.setAttribute("expand-label", "開く");
    el.setAttribute("collapse-label", "しまう");
    await Promise.resolve();
    const button = el.querySelector(".expandable-toggle") as HTMLButtonElement;
    expect(button.textContent).toBe("開く");
    button.click();
    expect(button.textContent).toBe("しまう");
  });

  it("survives rapid toggles and empty content", async () => {
    const el = await mount("");
    const button = el.querySelector(".expandable-toggle") as HTMLButtonElement;
    button.click();
    button.click();
    button.click();
    expect(el.isConnected).toBe(true);
  });

  it("keeps slot content in DOM while collapsed", async () => {
    const el = await mount("残る");
    expect(el.open).toBe(false);
    expect(el.textContent).toContain("残る");
  });
});
