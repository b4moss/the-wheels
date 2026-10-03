import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEventName, getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwPagination } from "./tw-pagination.js";

function tag(): string {
  return `${getPrefix()}pagination`;
}

async function mount(
  attrs: Record<string, string> = { page: "1", "total-pages": "5" },
): Promise<TwPagination> {
  const el = document.createElement(tag()) as TwPagination;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.append(el);
  await Promise.resolve();
  return el;
}

describe("TwPagination", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("pagination", TwPagination);
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it("sets data-tw-component and renders pages", async () => {
    const el = await mount();
    expect(el.getAttribute("data-tw-component")).toBe("pagination");
    expect(el.querySelectorAll(".pagination-page").length).toBe(5);
  });

  it("next emits change with detail.page", async () => {
    const el = await mount();
    const spy = vi.fn();
    el.addEventListener(getEventName("change"), spy);
    (el.querySelector(".pagination-next") as HTMLButtonElement).click();
    expect(el.getAttribute("page")).toBe("2");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]![0].detail.page).toBe(2);
  });

  it("page number click moves page", async () => {
    const el = await mount();
    const spy = vi.fn();
    el.addEventListener(getEventName("change"), spy);
    const page3 = el.querySelector(
      '.pagination-page[data-tw-page="3"]',
    ) as HTMLButtonElement;
    page3.click();
    expect(el.getAttribute("page")).toBe("3");
    expect(spy.mock.calls[0]![0].detail.page).toBe(3);
  });

  it("does not advance past ends", async () => {
    const el = await mount({ page: "5", "total-pages": "5" });
    const spy = vi.fn();
    el.addEventListener(getEventName("change"), spy);
    (el.querySelector(".pagination-next") as HTMLButtonElement).click();
    expect(el.getAttribute("page")).toBe("5");
    expect(spy).not.toHaveBeenCalled();

    el.setAttribute("page", "1");
    await Promise.resolve();
    (el.querySelector(".pagination-prev") as HTMLButtonElement).click();
    expect(el.getAttribute("page")).toBe("1");
  });

  it("follows setPrefix for event name", async () => {
    setPrefix("app-");
    defineComponent("pagination", TwPagination);
    const el = document.createElement("app-pagination") as TwPagination;
    el.setAttribute("page", "1");
    el.setAttribute("total-pages", "3");
    document.body.append(el);
    await Promise.resolve();
    const spy = vi.fn();
    el.addEventListener("app-change", spy);
    (el.querySelector(".pagination-next") as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalled();
  });
});
