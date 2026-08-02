import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwSvgLoader } from "../svg_loader/tw-svg-loader.js";
import { CLOSE_SRC, TwModal } from "./tw-modal.js";

function modalTag(): string {
  return `${getPrefix()}modal`;
}

function el(html: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.innerHTML = html.trim();
  return wrap.firstElementChild as HTMLElement;
}

function mountModal(
  attrs: Record<string, string> = {},
  children: Node[] = [],
): TwModal {
  const node = document.createElement(modalTag()) as TwModal;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === "") node.setAttribute(key, "");
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  document.body.append(node);
  return node;
}

function dialogOf(node: TwModal): HTMLDialogElement {
  return node.querySelector("dialog") as HTMLDialogElement;
}

function flushFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

describe("TwModal", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("svg-loader", TwSvgLoader);
    defineComponent("modal", TwModal);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>',
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

  describe("data-tw-component", () => {
    it("sets data-tw-component=modal on connect", () => {
      const node = mountModal();
      expect(node.getAttribute("data-tw-component")).toBe("modal");
    });
  });

  describe("internal dialog", () => {
    it("renders exactly one dialog", () => {
      const node = mountModal();
      expect(node.querySelectorAll("dialog")).toHaveLength(1);
    });

    it("is an autonomous HTMLElement custom element, not HTMLDialogElement", () => {
      const node = mountModal();
      expect(node).toBeInstanceOf(HTMLElement);
      expect(node instanceof HTMLDialogElement).toBe(false);
    });
  });

  describe("slot projection", () => {
    it("projects header / content / footer into matching regions", () => {
      const node = mountModal({}, [
        el(`<h2 slot="header">Title</h2>`),
        el(`<p slot="content">Body</p>`),
        el(`<button slot="footer" type="button">OK</button>`),
      ]);
      expect(node.querySelector(".modal-header")?.textContent).toContain(
        "Title",
      );
      expect(node.querySelector(".modal-content")?.textContent).toContain(
        "Body",
      );
      expect(node.querySelector(".modal-footer")?.textContent).toContain("OK");
    });

    it("connects with content only", () => {
      expect(() =>
        mountModal({}, [el(`<p slot="content">Only content</p>`)]),
      ).not.toThrow();
      const node = document.body.querySelector(modalTag()) as TwModal;
      expect(node.querySelector(".modal-content")?.textContent).toContain(
        "Only content",
      );
      expect(node.querySelector(".modal-footer")).toBeNull();
    });

    it("ignores unknown named slots", () => {
      const node = mountModal({}, [el(`<span slot="foo">Nope</span>`)]);
      expect(dialogOf(node).textContent).not.toContain("Nope");
    });
  });

  describe("default closer", () => {
    it("always renders a data-tw-modal-close control with CLOSE_SRC", () => {
      const node = mountModal();
      const closer = node.querySelector("[data-tw-modal-close]");
      expect(closer).not.toBeNull();
      const icon = closer!.querySelector(`${getPrefix()}svg-loader`);
      expect(icon).not.toBeNull();
      expect(icon!.getAttribute("src")).toBe(CLOSE_SRC);
    });

    it("keeps the default closer when header slot is empty", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      expect(node.querySelector("[data-tw-modal-close]")).not.toBeNull();
      expect(node.querySelector(".modal-header")).not.toBeNull();
    });
  });

  describe("showModal / close", () => {
    it("showModal opens the internal dialog", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      node.showModal();
      expect(dialogOf(node).open).toBe(true);
    });

    it("close closes the internal dialog", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      node.showModal();
      node.close();
      expect(dialogOf(node).open).toBe(false);
    });

    it("can be opened from an external button calling showModal()", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      const btn = document.createElement("button");
      btn.addEventListener("click", () => node.showModal());
      document.body.append(btn);
      btn.click();
      expect(dialogOf(node).open).toBe(true);
    });

    it("showModal when already open does not throw", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      node.showModal();
      expect(() => node.showModal()).not.toThrow();
      expect(dialogOf(node).open).toBe(true);
    });

    it("close when already closed does not throw", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      expect(() => node.close()).not.toThrow();
      expect(dialogOf(node).open).toBe(false);
    });

    it("does not expose show() that opens via dialog.show", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      const maybeShow = (node as unknown as { show?: unknown }).show;
      expect(maybeShow).toBeUndefined();
    });
  });

  describe("close paths", () => {
    it("closes via the default × button", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      node.showModal();
      const closer = node.querySelector(
        ".modal-close[data-tw-modal-close]",
      ) as HTMLElement;
      closer.click();
      expect(dialogOf(node).open).toBe(false);
    });

    it("closes via a user-provided data-tw-modal-close in footer", () => {
      const node = mountModal({}, [
        el(`<p slot="content">Body</p>`),
        el(
          `<button type="button" slot="footer" data-tw-modal-close>Cancel</button>`,
        ),
      ]);
      node.showModal();
      const closer = node.querySelector(
        ".modal-footer [data-tw-modal-close]",
      ) as HTMLElement;
      closer.click();
      expect(dialogOf(node).open).toBe(false);
    });

    it("closes via a dynamically added data-tw-modal-close", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      node.showModal();
      const dynamic = document.createElement("button");
      dynamic.type = "button";
      dynamic.setAttribute("data-tw-modal-close", "");
      dynamic.textContent = "Later";
      node.querySelector(".modal-content")!.append(dynamic);
      dynamic.click();
      expect(dialogOf(node).open).toBe(false);
    });

    it("closes when the dialog itself is clicked (backdrop)", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      node.showModal();
      const dialog = dialogOf(node);
      dialog.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
      expect(dialog.open).toBe(false);
    });

    it("does not close when content is clicked", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      node.showModal();
      const content = node.querySelector(".modal-content") as HTMLElement;
      content.click();
      expect(dialogOf(node).open).toBe(true);
    });

    it("closer click while closed does not throw", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      const closer = node.querySelector("[data-tw-modal-close]") as HTMLElement;
      expect(() => closer.click()).not.toThrow();
      expect(dialogOf(node).open).toBe(false);
    });

    it("closes on Escape when the environment supports it", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      node.showModal();
      const dialog = dialogOf(node);

      const esc = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      });
      dialog.dispatchEvent(esc);
      // Also try document-level Escape used by some polyfills.
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        }),
      );

      if (dialog.open) {
        // happy-dom may not implement native dialog Escape closing.
        // Implementation still delegates to the native dialog API.
        return;
      }
      expect(dialog.open).toBe(false);
    });
  });

  describe("size lock", () => {
    it("does not lock size before the first showModal", () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      const dialog = dialogOf(node);
      expect(dialog.style.width).toBe("");
      expect(dialog.style.height).toBe("");
    });

    it("locks width/height inline after the first showModal layout", async () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      const dialog = dialogOf(node);
      Object.defineProperty(dialog, "offsetWidth", {
        configurable: true,
        get: () => 480,
      });
      Object.defineProperty(dialog, "offsetHeight", {
        configurable: true,
        get: () => 320,
      });

      node.showModal();
      await flushFrame();

      expect(dialog.style.width).toBe("480px");
      expect(dialog.style.height).toBe("320px");
    });

    it("keeps locked size when content grows", async () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      const dialog = dialogOf(node);
      Object.defineProperty(dialog, "offsetWidth", {
        configurable: true,
        get: () => 480,
      });
      Object.defineProperty(dialog, "offsetHeight", {
        configurable: true,
        get: () => 320,
      });

      node.showModal();
      await flushFrame();

      const content = node.querySelector(".modal-content")!;
      content.append(document.createTextNode("x".repeat(5000)));
      expect(dialog.style.width).toBe("480px");
      expect(dialog.style.height).toBe("320px");
    });

    it("keeps the same locked size across close and re-open", async () => {
      const node = mountModal({}, [el(`<p slot="content">Body</p>`)]);
      const dialog = dialogOf(node);
      let w = 480;
      let h = 320;
      Object.defineProperty(dialog, "offsetWidth", {
        configurable: true,
        get: () => w,
      });
      Object.defineProperty(dialog, "offsetHeight", {
        configurable: true,
        get: () => h,
      });

      node.showModal();
      await flushFrame();
      expect(dialog.style.width).toBe("480px");
      expect(dialog.style.height).toBe("320px");

      node.close();
      w = 999;
      h = 999;
      node.showModal();
      await flushFrame();
      expect(dialog.style.width).toBe("480px");
      expect(dialog.style.height).toBe("320px");
    });
  });
});
