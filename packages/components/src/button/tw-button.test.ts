import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwSpinner } from "../spinner/tw-spinner.js";
import { TwSvgLoader } from "../svg_loader/tw-svg-loader.js";
import { LOCK_SRC, TwButton } from "./tw-button.js";

function buttonTag(): string {
  return `${getPrefix()}button`;
}

function mountButton(
  attrs: Record<string, string> = {},
  children: Node[] = [],
): TwButton {
  const el = document.createElement(buttonTag()) as TwButton;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === "") el.setAttribute(key, "");
    else el.setAttribute(key, value);
  }
  for (const child of children) el.append(child);
  document.body.append(el);
  return el;
}

describe("TwButton", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("svg-loader", TwSvgLoader);
    defineComponent("spinner", TwSpinner);
    defineComponent("button", TwButton);
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
    vi.restoreAllMocks();
  });

  it("sets data-tw-component=button on connect", () => {
    const el = mountButton();
    expect(el.getAttribute("data-tw-component")).toBe("button");
  });

  it("renders inner button type=button by default", () => {
    const el = mountButton();
    const button = el.querySelector("button");
    expect(button).not.toBeNull();
    expect(button!.type).toBe("button");
  });

  it("forwards type=submit and type=reset", () => {
    const submit = mountButton({ type: "submit" });
    expect(submit.querySelector("button")!.type).toBe("submit");
    const reset = mountButton({ type: "reset" });
    expect(reset.querySelector("button")!.type).toBe("reset");
  });

  it("falls back to button for empty type", () => {
    const el = mountButton({ type: "" });
    expect(el.querySelector("button")!.type).toBe("button");
  });

  it("treats missing variant as default", () => {
    const el = mountButton();
    expect(el.getAttribute("variant")).toBe("default");
    expect(el.querySelector("button")!.classList.contains("button--default")).toBe(
      true,
    );
  });

  it("accepts stroke / ghost / default variants", () => {
    const stroke = mountButton({ variant: "stroke" });
    expect(stroke.querySelector("button")!.classList.contains("button--stroke")).toBe(
      true,
    );
    const ghost = mountButton({ variant: "ghost" });
    expect(ghost.querySelector("button")!.classList.contains("button--ghost")).toBe(
      true,
    );
    const def = mountButton({ variant: "default" });
    expect(def.querySelector("button")!.classList.contains("button--default")).toBe(
      true,
    );
  });

  it("falls back unknown variant to default", () => {
    const el = mountButton({ variant: "primary" });
    expect(el.getAttribute("variant")).toBe("default");
    expect(el.querySelector("button")!.classList.contains("button--default")).toBe(
      true,
    );
  });

  it("projects default text into label without icon wrappers", () => {
    const el = mountButton({}, [document.createTextNode("Save")]);
    expect(el.querySelector(".button-label")!.textContent).toBe("Save");
    expect(el.querySelector(".button-icon-left")).toBeNull();
    expect(el.querySelector(".button-icon-right")).toBeNull();
  });

  it("projects icon-left and icon-right slots", () => {
    const left = document.createElement("span");
    left.setAttribute("slot", "icon-left");
    left.textContent = "L";
    const right = document.createElement("span");
    right.setAttribute("slot", "icon-right");
    right.textContent = "R";
    const el = mountButton({}, [
      left,
      document.createTextNode("Label"),
      right,
    ]);
    expect(el.querySelector(".button-icon-left")!.textContent).toBe("L");
    expect(el.querySelector(".button-label")!.textContent).toBe("Label");
    expect(el.querySelector(".button-icon-right")!.textContent).toBe("R");
  });

  it("omits empty icon-left wrapper", () => {
    const left = document.createElement("span");
    left.setAttribute("slot", "icon-left");
    const el = mountButton({}, [left, document.createTextNode("Only")]);
    expect(el.querySelector(".button-icon-left")).toBeNull();
    expect(el.querySelector(".button-label")!.textContent).toBe("Only");
  });

  it("ignores unknown slot names without creating icon wrappers", () => {
    const weird = document.createElement("span");
    weird.setAttribute("slot", "foo");
    weird.textContent = "X";
    const el = mountButton({}, [weird]);
    expect(el.querySelector(".button-icon-left")).toBeNull();
    expect(el.querySelector(".button-icon-right")).toBeNull();
    expect(el.querySelector(".button-label")!.textContent).toBe("");
  });

  it("disable-on-click disables and shows spinner after click", () => {
    const el = mountButton(
      { "disable-on-click": "" },
      [document.createTextNode("Go")],
    );
    el.querySelector("button")!.click();
    expect(el.querySelector("button")!.disabled).toBe(true);
    expect(el.querySelector(".button-label")!.hasAttribute("hidden")).toBe(true);
    expect(el.querySelector(".button-spinner")).not.toBeNull();
  });

  it("does not disable on click without disable-on-click", () => {
    const el = mountButton({}, [document.createTextNode("Go")]);
    el.querySelector("button")!.click();
    expect(el.querySelector("button")!.disabled).toBe(false);
    expect(el.querySelector(".button-spinner")).toBeNull();
  });

  it("does not add spinner when already disabled", () => {
    const el = mountButton(
      { disabled: "", "disable-on-click": "" },
      [document.createTextNode("Go")],
    );
    el.querySelector("button")!.click();
    expect(el.querySelectorAll(".button-spinner").length).toBe(0);
  });

  it("keeps click-disabled state after removing disable-on-click", () => {
    const el = mountButton(
      { "disable-on-click": "" },
      [document.createTextNode("Go")],
    );
    el.querySelector("button")!.click();
    el.removeAttribute("disable-on-click");
    expect(el.querySelector("button")!.disabled).toBe(true);
    expect(el.querySelector(".button-spinner")).not.toBeNull();
  });

  it("shows lock icon when disabled", async () => {
    const el = mountButton(
      { disabled: "" },
      [document.createTextNode("Go")],
    );
    expect(el.querySelector(".button-lock")).not.toBeNull();
    expect(el.querySelector(".button-lock")!.getAttribute("src")).toBe(LOCK_SRC);
  });

  it("shows lock after disable-on-click", () => {
    const el = mountButton(
      { "disable-on-click": "" },
      [document.createTextNode("Go")],
    );
    el.querySelector("button")!.click();
    expect(el.querySelector(".button-lock")).not.toBeNull();
  });

  it("hides lock when re-enabled", () => {
    const el = mountButton(
      { disabled: "" },
      [document.createTextNode("Go")],
    );
    el.removeAttribute("disabled");
    expect(el.querySelector(".button-lock")).toBeNull();
  });

  it("does not show lock when not disabled", () => {
    const el = mountButton({}, [document.createTextNode("Go")]);
    expect(el.querySelector(".button-lock")).toBeNull();
  });

  it("reset() clears disable-on-click derived state", () => {
    const el = mountButton(
      { "disable-on-click": "" },
      [document.createTextNode("Go")],
    );
    el.querySelector("button")!.click();
    el.reset();
    expect(el.querySelector("button")!.disabled).toBe(false);
    expect(el.querySelector(".button-spinner")).toBeNull();
    expect(el.querySelector(".button-label")!.hasAttribute("hidden")).toBe(false);
  });

  it("reset() is a no-op before click", () => {
    const el = mountButton(
      { "disable-on-click": "" },
      [document.createTextNode("Go")],
    );
    expect(() => el.reset()).not.toThrow();
    expect(el.querySelector("button")!.disabled).toBe(false);
    expect(el.querySelector(".button-spinner")).toBeNull();
  });

  it("reset() does not clear author disabled attribute", () => {
    const el = mountButton(
      { disabled: "" },
      [document.createTextNode("Go")],
    );
    el.reset();
    expect(el.hasAttribute("disabled")).toBe(true);
    expect(el.querySelector("button")!.disabled).toBe(true);
  });
});
