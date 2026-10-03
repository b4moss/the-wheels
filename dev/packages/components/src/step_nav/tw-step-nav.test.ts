import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwStepNav } from "./tw-step-nav.js";

function tag(): string {
  return `${getPrefix()}step-nav`;
}

async function mount(
  statuses: Array<"current" | "done" | "not_yet" | string> = [
    "done",
    "current",
    "not_yet",
  ],
): Promise<TwStepNav> {
  const el = document.createElement(tag()) as TwStepNav;
  for (const [i, status] of statuses.entries()) {
    const step = document.createElement("div");
    step.setAttribute("status", status);
    step.textContent = `Step ${i + 1}`;
    el.append(step);
  }
  document.body.append(el);
  await Promise.resolve();
  return el;
}

describe("TwStepNav", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("step-nav", TwStepNav);
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it("sets data-tw-component and reflects statuses", async () => {
    const el = await mount();
    expect(el.getAttribute("data-tw-component")).toBe("step-nav");
    const steps = el.querySelectorAll("[data-tw-step]");
    expect(steps.length).toBe(3);
    expect(steps[0]!.getAttribute("data-tw-step-status")).toBe("done");
    expect(steps[1]!.getAttribute("data-tw-step-status")).toBe("current");
    expect(steps[2]!.getAttribute("data-tw-step-status")).toBe("not_yet");
  });

  it("setCurrent only flips the target to current", async () => {
    const el = await mount(["done", "current", "not_yet"]);
    el.setCurrent(2);
    const steps = [...el.querySelectorAll("[data-tw-step]")];
    expect(steps[2]!.getAttribute("status")).toBe("current");
    expect(steps[0]!.getAttribute("status")).toBe("done");
    expect(steps[1]!.getAttribute("status")).toBe("current");
  });

  it("ignores out-of-range setCurrent", async () => {
    const el = await mount(["current"]);
    el.setCurrent(5);
    el.setCurrent(-1);
    expect(el.querySelector("[data-tw-step]")!.getAttribute("status")).toBe(
      "current",
    );
  });

  it("click does not change status", async () => {
    const el = await mount(["not_yet", "current"]);
    const first = el.querySelector("[data-tw-step]") as HTMLElement;
    first.click();
    expect(first.getAttribute("status")).toBe("not_yet");
  });

  it("connects with zero steps", async () => {
    const el = document.createElement(tag()) as TwStepNav;
    document.body.append(el);
    await Promise.resolve();
    expect(el.getAttribute("data-tw-component")).toBe("step-nav");
  });
});
