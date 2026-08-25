import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEventName, getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import {
  resetToastStackForTests,
  TwToast,
} from "./tw-toast.js";
import { SNACKBAR_LAYER_ATTR } from "../snackbar_layer/snackbar-layer.js";

function tag(): string {
  return `${getPrefix()}toast`;
}

async function mount(
  text = "保存しました",
  attrs: Record<string, string> = {},
): Promise<TwToast> {
  const el = document.createElement(tag()) as TwToast;
  el.textContent = text;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.append(el);
  await Promise.resolve();
  return el;
}

describe("TwToast", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("toast", TwToast);
    vi.useFakeTimers();
  });

  afterEach(() => {
    resetToastStackForTests();
    document.body.replaceChildren();
    vi.useRealTimers();
  });

  it("sets data-tw-component", async () => {
    const el = await mount();
    expect(el.getAttribute("data-tw-component")).toBe("toast");
  });

  it("show/hide toggles visibility", async () => {
    const el = await mount("Hello", { "duration-ms": "0" });
    el.show();
    expect(el.isShown()).toBe(true);
    expect(
      document.querySelector(`[${SNACKBAR_LAYER_ATTR}]`)?.hasAttribute("hidden"),
    ).toBe(false);
    el.hide();
    expect(el.isShown()).toBe(false);
  });

  it("auto-hides after duration-ms", async () => {
    const el = await mount("Bye", { "duration-ms": "1000" });
    el.show();
    expect(el.isShown()).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(el.isShown()).toBe(false);
  });

  it("duration-ms=0 does not auto-hide", async () => {
    const el = await mount("Stay", { "duration-ms": "0" });
    el.show();
    vi.advanceTimersByTime(10_000);
    expect(el.isShown()).toBe(true);
  });

  it("stacks multiple toasts", async () => {
    const a = await mount("A", { "duration-ms": "0" });
    const b = await mount("B", { "duration-ms": "0" });
    a.show();
    b.show();
    expect(document.querySelectorAll(".toast-item").length).toBe(2);
    a.hide();
    expect(document.querySelectorAll(".toast-item").length).toBe(1);
    expect(b.isShown()).toBe(true);
  });

  it("invalid variant still shows", async () => {
    const el = await mount("X", { variant: "nope", "duration-ms": "0" });
    el.show();
    expect(el.isShown()).toBe(true);
    expect(
      document.querySelector(".toast-item")?.getAttribute("data-tw-toast-variant"),
    ).toBe("info");
  });
});
