import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEventName, getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwDropdown } from "../dropdown/tw-dropdown.js";
import { TwInfiniteScroll } from "../infinite_scroll/tw-infinite-scroll.js";
import { TwCombobox } from "./tw-combobox.js";

function comboboxTag(): string {
  return `${getPrefix()}combobox`;
}

function dropdownTag(): string {
  return `${getPrefix()}dropdown`;
}

function infiniteTag(): string {
  return `${getPrefix()}infinite-scroll`;
}

function el(html: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.innerHTML = html.trim();
  return wrap.firstElementChild as HTMLElement;
}

function mount(
  attrs: Record<string, string> = {},
  children: Node[] = [],
): TwCombobox {
  const node = document.createElement(comboboxTag()) as TwCombobox;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === "") node.setAttribute(key, "");
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  document.body.append(node);
  return node;
}

function searchOf(node: TwCombobox): HTMLInputElement {
  return node.querySelector(".combobox-search") as HTMLInputElement;
}

function optionLabels(node: TwCombobox): string[] {
  return Array.from(node.querySelectorAll("[data-tw-option]")).map(
    (o) => o.textContent ?? "",
  );
}

async function flushMicrotasks(n = 3): Promise<void> {
  for (let i = 0; i < n; i++) await Promise.resolve();
}

async function flushAnimationFrames(n = 2): Promise<void> {
  for (let i = 0; i < n; i++) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
}

describe("TwCombobox", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("dropdown", TwDropdown);
    defineComponent("infinite-scroll", TwInfiniteScroll);
    defineComponent("combobox", TwCombobox);
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  describe("data-tw-component", () => {
    it("sets data-tw-component=combobox on connect", () => {
      const node = mount();
      expect(node.getAttribute("data-tw-component")).toBe("combobox");
    });

    it("keeps data-tw-component under a custom prefix", () => {
      setPrefix("app");
      defineComponent("dropdown", TwDropdown);
      defineComponent("infinite-scroll", TwInfiniteScroll);
      defineComponent("combobox", TwCombobox);
      const node = document.createElement("app-combobox") as TwCombobox;
      document.body.append(node);
      expect(node.getAttribute("data-tw-component")).toBe("combobox");
    });
  });

  describe("Dropdown composition", () => {
    it("creates an internal Dropdown host", () => {
      const node = mount();
      expect(node.querySelector(dropdownTag())).toBe(node.getDropdown());
    });

    it("delegates open / close / toggle", () => {
      const node = mount({}, [
        el(`<button type="button" slot="trigger">Pick</button>`),
      ]);
      const dropdown = node.getDropdown()!;
      node.open();
      expect(node.hasAttribute("open")).toBe(true);
      expect(dropdown.hasAttribute("open")).toBe(true);
      node.close();
      expect(node.hasAttribute("open")).toBe(false);
      node.toggle();
      expect(dropdown.hasAttribute("open")).toBe(true);
    });

    it("open() while already open stays open", () => {
      const node = mount({}, [
        el(`<button type="button" slot="trigger">Pick</button>`),
      ]);
      node.open();
      node.open();
      expect(node.hasAttribute("open")).toBe(true);
    });

    it("closes on outside click and Escape via Dropdown", async () => {
      const node = mount({}, [
        el(`<button type="button" slot="trigger">Pick</button>`),
      ]);
      node.open();
      const outside = document.createElement("div");
      document.body.append(outside);
      outside.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, composed: true }),
      );
      expect(node.getDropdown()!.hasAttribute("open")).toBe(false);
      await flushMicrotasks();
      expect(node.hasAttribute("open")).toBe(false);

      node.open();
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      expect(node.getDropdown()!.hasAttribute("open")).toBe(false);
      await flushMicrotasks();
      expect(node.hasAttribute("open")).toBe(false);
    });
  });

  describe("slots", () => {
    it("projects trigger / subarea / footer", async () => {
      const trigger = el(`<button slot="trigger">T</button>`);
      const sub = el(`<div slot="subarea">Sub</div>`);
      const foot = el(`<div slot="footer">Foot</div>`);
      const node = mount({}, [trigger, sub, foot]);
      await flushMicrotasks();
      expect(node.querySelector(`${dropdownTag()} [slot="trigger"]`)).toBe(
        trigger,
      );
      const panel = node.querySelector(".combobox-panel")!;
      const search = panel.querySelector(".combobox-search")!;
      const subarea = panel.querySelector(".combobox-subarea")!;
      const listHost = panel.querySelector(".combobox-list-host")!;
      const footer = panel.querySelector(".combobox-footer")!;
      expect(subarea.contains(sub)).toBe(true);
      expect(footer.contains(foot)).toBe(true);
      // Order: search → subarea → … → list → footer
      const children = Array.from(panel.children);
      expect(children.indexOf(search)).toBeLessThan(children.indexOf(subarea));
      expect(children.indexOf(subarea)).toBeLessThan(children.indexOf(listHost));
      expect(children.indexOf(listHost)).toBeLessThan(children.indexOf(footer));
    });

    it("ignores unknown slot=foo without throw", async () => {
      const foo = el(`<div slot="foo">Nope</div>`);
      const node = mount({}, [foo]);
      await flushMicrotasks();
      expect(node.querySelector(".combobox-subarea")?.contains(foo)).toBe(false);
      expect(node.querySelector(".combobox-footer")?.contains(foo)).toBe(false);
      node.open();
      node.close();
    });
  });

  describe("mode", () => {
    it("defaults to static", () => {
      const node = mount();
      node.options = [{ value: 1, label: "A" }];
      node.open();
      expect(node.querySelector(infiniteTag())).toBeNull();
      expect(optionLabels(node)).toContain("A");
    });

    it("falls back invalid mode to static", () => {
      const node = mount({ mode: "nope" });
      node.options = [{ value: 1, label: "A" }];
      node.open();
      expect(node.querySelector(infiniteTag())).toBeNull();
    });
  });

  describe("static options + filter", () => {
    it("shows options and filters case-insensitively", () => {
      const node = mount();
      node.options = [
        { value: 1, label: "Apple" },
        { value: 2, label: "Banana" },
      ];
      node.open();
      expect(optionLabels(node)).toEqual(["Apple", "Banana"]);
      const search = searchOf(node);
      search.value = "app";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      expect(optionLabels(node)).toEqual(["Apple"]);
      search.value = "";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      expect(optionLabels(node)).toEqual(["Apple", "Banana"]);
    });

    it("empty options and no-match are safe", () => {
      const node = mount();
      node.open();
      expect(optionLabels(node)).toEqual([]);
      node.options = [{ value: 1, label: "Only" }];
      node.open();
      const search = searchOf(node);
      search.value = "zzz";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      expect(optionLabels(node)).toEqual([]);
    });
  });

  describe("async loadOptions + debounce", () => {
    it("calls loadOptions after debounce with query/page/signal", async () => {
      const node = mount({ mode: "async", debounce: "0" });
      const loader = vi.fn(async (ctx: {
        query: string;
        page: number | string;
        signal: AbortSignal;
      }) => {
        expect(ctx.signal).toBeInstanceOf(AbortSignal);
        return {
          items: [{ value: 1, label: `Hit:${ctx.query}` }],
          hasMore: false,
        };
      });
      node.loadOptions = loader;
      node.open();
      await flushMicrotasks(5);
      expect(loader).toHaveBeenCalled();
      expect(loader.mock.calls[0]![0]).toEqual(
        expect.objectContaining({
          query: "",
          direction: "initial",
        }),
      );

      const search = searchOf(node);
      search.value = "tea";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      await flushMicrotasks(5);
      await vi.waitFor(() => {
        expect(optionLabels(node).some((l) => l.includes("tea"))).toBe(true);
      });
    });

    it("aborts previous signal on rapid input", async () => {
      const node = mount({ mode: "async", debounce: "0" });
      const signals: AbortSignal[] = [];
      node.loadOptions = async (ctx) => {
        signals.push(ctx.signal);
        await new Promise((r) => setTimeout(r, 20));
        return {
          items: [{ value: ctx.query, label: ctx.query }],
          hasMore: false,
        };
      };
      node.open();
      await flushMicrotasks(3);
      const search = searchOf(node);
      search.value = "a";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      await flushMicrotasks(3);
      search.value = "ab";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      await flushMicrotasks(3);
      await vi.waitFor(() => {
        expect(signals.length).toBeGreaterThanOrEqual(2);
      });
      expect(signals.some((s) => s.aborted)).toBe(true);
    });

    it("clears loading when loader rejects", async () => {
      const node = mount({ mode: "async", debounce: "0" });
      node.loadOptions = async () => {
        throw new Error("fail");
      };
      node.open();
      await flushMicrotasks(5);
      await vi.waitFor(() => {
        expect(node.loading).toBe(false);
        expect(node.hasAttribute("loading")).toBe(false);
      });
    });
  });

  describe("debounce attribute", () => {
    it("defaults to 300 and falls back invalid to 300", async () => {
      vi.useFakeTimers();
      const node = mount({ mode: "async" });
      const loader = vi.fn(async () => ({
        items: [{ value: 1, label: "x" }],
        hasMore: false,
      }));
      node.loadOptions = loader;
      node.open();
      await flushMicrotasks(2);
      // open kick is immediate via #runFetch, not debounced
      await vi.advanceTimersByTimeAsync(0);
      await flushMicrotasks(5);
      loader.mockClear();

      const search = searchOf(node);
      search.value = "q";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      expect(loader).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(299);
      expect(loader).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      await flushMicrotasks(5);
      expect(loader).toHaveBeenCalled();

      node.setAttribute("debounce", "nope");
      loader.mockClear();
      search.value = "q2";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      await vi.advanceTimersByTimeAsync(300);
      await flushMicrotasks(5);
      expect(loader).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe("hybrid", () => {
    it("shows static options then merges loadOptions via InfiniteScroll", async () => {
      const node = mount({
        mode: "hybrid",
        debounce: "0",
        "sort-key": "updated_at",
        "sort-direction": "desc",
      });
      node.options = [
        { value: "s", label: "Static", updated_at: 5 },
      ];
      node.loadOptions = async () => ({
        items: [{ value: "a", label: "Async", updated_at: 10 }],
        hasMore: false,
      });
      node.open();
      await flushMicrotasks(5);
      await vi.waitFor(() => {
        const labels = optionLabels(node);
        expect(labels).toContain("Async");
        expect(labels).toContain("Static");
      });
      // desc by updated_at → Async first
      expect(optionLabels(node)[0]).toBe("Async");
    });

    it("opens with list scrolled to top after hybrid seed merge", async () => {
      const node = mount({
        mode: "hybrid",
        debounce: "0",
        "sort-key": "updated_at",
        "sort-direction": "desc",
      });
      node.options = [
        { value: "s1", label: "StaticLow", updated_at: 5 },
        { value: "s2", label: "StaticMid", updated_at: 8 },
      ];
      node.loadOptions = async () => ({
        items: [
          { value: "a1", label: "FetchedHigh", updated_at: 100 },
          { value: "a2", label: "FetchedMid", updated_at: 50 },
          { value: "a3", label: "FetchedLow", updated_at: 20 },
        ],
        hasMore: false,
      });
      node.open();
      await flushMicrotasks(5);
      await vi.waitFor(() => {
        expect(optionLabels(node)[0]).toBe("FetchedHigh");
      });
      const viewport = node
        .getInfiniteScroll()
        ?.querySelector(".infinite-scroll-viewport") as HTMLElement;
      expect(viewport.scrollTop).toBe(0);
    });

    it("works with options only (no loadOptions)", async () => {
      const node = mount({ mode: "hybrid", debounce: "0" });
      node.options = [{ value: 1, label: "Only" }];
      node.open();
      await flushMicrotasks(5);
      await vi.waitFor(() => {
        expect(optionLabels(node)).toContain("Only");
      });
    });
  });

  describe("load-request second path", () => {
    it("fires load-request and applies via applyLoadResult", async () => {
      const node = mount({ mode: "async", debounce: "0" });
      const seen: unknown[] = [];
      node.addEventListener(getEventName("load-request"), ((event: Event) => {
        const ce = event as CustomEvent;
        seen.push(ce.detail);
        node.applyLoadResult({
          items: [{ value: 9, label: "FromEvent" }],
          hasMore: false,
        });
      }) as EventListener);
      node.open();
      await flushMicrotasks(5);
      await vi.waitFor(() => {
        expect(optionLabels(node)).toContain("FromEvent");
      });
      expect(seen.length).toBeGreaterThan(0);
      expect(seen[0]).toEqual(
        expect.objectContaining({ query: "", page: 1 }),
      );
    });

    it("does not fire load-request when loadOptions is set", async () => {
      const node = mount({ mode: "async", debounce: "0" });
      const spy = vi.fn();
      node.addEventListener(getEventName("load-request"), spy);
      node.loadOptions = async () => ({
        items: [{ value: 1, label: "Prop" }],
        hasMore: false,
      });
      node.open();
      await flushMicrotasks(5);
      await vi.waitFor(() => {
        expect(optionLabels(node)).toContain("Prop");
      });
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("selection", () => {
    it("single select sets value and dispatches change", () => {
      const node = mount();
      node.options = [
        { value: 1, label: "A" },
        { value: 2, label: "B" },
      ];
      node.open();
      const changes: Event[] = [];
      node.addEventListener("change", (e) => changes.push(e));
      const opt = node.querySelector('[data-value="2"]') as HTMLElement;
      opt.click();
      expect(node.value).toBe(2);
      expect(changes).toHaveLength(1);
      expect(changes[0]!.target).toBe(node);
      expect(node.hasAttribute("open")).toBe(false);
    });

    it("does not select disabled options", () => {
      const node = mount();
      node.options = [{ value: 1, label: "Nope", disabled: true }];
      node.open();
      (node.querySelector("[data-tw-option]") as HTMLElement).click();
      expect(node.value).toBeNull();
    });

    it("host disabled blocks open/select", () => {
      const node = mount({ disabled: "" }, [
        el(`<button slot="trigger">T</button>`),
      ]);
      node.options = [{ value: 1, label: "A" }];
      node.open();
      expect(node.hasAttribute("open")).toBe(false);
    });

    it("multiple toggles and respects max-selected", () => {
      const node = mount({ multiple: "", "max-selected": "2" });
      node.options = [
        { value: 1, label: "A" },
        { value: 2, label: "B" },
        { value: 3, label: "C" },
      ];
      node.open();
      (node.querySelector('[data-value="1"]') as HTMLElement).click();
      (node.querySelector('[data-value="2"]') as HTMLElement).click();
      (node.querySelector('[data-value="3"]') as HTMLElement).click();
      expect(node.value).toEqual([1, 2]);
      (node.querySelector('[data-value="1"]') as HTMLElement).click();
      expect(node.value).toEqual([2]);
    });

    it("invalid max-selected means no limit", () => {
      const node = mount({ multiple: "", "max-selected": "nope" });
      node.options = [
        { value: 1, label: "A" },
        { value: 2, label: "B" },
        { value: 3, label: "C" },
      ];
      node.open();
      for (const v of [1, 2, 3]) {
        (node.querySelector(`[data-value="${v}"]`) as HTMLElement).click();
      }
      expect(node.value).toEqual([1, 2, 3]);
    });
  });

  describe("renderOption / label fallback", () => {
    it("uses renderOption when provided", () => {
      const node = mount();
      node.renderOption = (opt) => {
        const span = document.createElement("span");
        span.textContent = `custom:${opt.label}`;
        return span;
      };
      node.options = [{ value: 1, label: "A" }];
      node.open();
      expect(optionLabels(node)).toEqual(["custom:A"]);
    });

    it("falls back to String(value) when label missing", () => {
      const node = mount();
      node.options = [{ value: 42 }];
      node.open();
      expect(optionLabels(node)).toEqual(["42"]);
    });
  });

  describe("placeholder / placement", () => {
    it("reflects placeholder on search input", () => {
      const node = mount({ placeholder: "Search…" });
      expect(searchOf(node).placeholder).toBe("Search…");
    });

    it("forwards placement to Dropdown", () => {
      const node = mount({ placement: "top-end" });
      expect(node.getDropdown()!.getAttribute("placement")).toBe("top-end");
    });
  });

  describe("loading", () => {
    it("shows loading during async fetch and clears after", async () => {
      const node = mount({ mode: "async", debounce: "0" });
      let release!: () => void;
      const gate = new Promise<void>((r) => {
        release = r;
      });
      node.loadOptions = async () => {
        await gate;
        return { items: [{ value: 1, label: "Done" }], hasMore: false };
      };
      node.open();
      await flushMicrotasks(3);
      expect(node.hasAttribute("loading")).toBe(true);
      release();
      await vi.waitFor(() => {
        expect(node.hasAttribute("loading")).toBe(false);
        expect(optionLabels(node)).toContain("Done");
      });
    });
  });

  describe("Combobox × InfiniteScroll", () => {
    it("static does not require InfiniteScroll", () => {
      const node = mount({ mode: "static" });
      node.options = [{ value: 1, label: "A" }];
      node.open();
      expect(node.querySelector(infiniteTag())).toBeNull();
    });

    it("async uses InfiniteScroll and pages on down", async () => {
      const node = mount({ mode: "async", debounce: "0" });
      const dirs: string[] = [];
      node.loadOptions = async ({ direction, page }) => {
        dirs.push(String(direction));
        if (direction === "initial") {
          return {
            items: [{ value: 1, label: "P1" }],
            hasMore: true,
            nextPage: 2,
          };
        }
        return {
          items: [{ value: page, label: `P${page}` }],
          hasMore: false,
        };
      };
      node.open();
      await flushMicrotasks(5);
      await vi.waitFor(() => {
        expect(node.querySelector(infiniteTag())).not.toBeNull();
        expect(optionLabels(node)).toContain("P1");
      });
      const inf = node.getInfiniteScroll()!;
      await inf.loadDirection("down");
      expect(dirs).toContain("down");
      expect(optionLabels(node).length).toBeGreaterThanOrEqual(2);
    });

    it("async open leaves InfiniteScroll viewport at top", async () => {
      const node = mount({
        mode: "async",
        debounce: "0",
        "sort-key": "updated_at",
        "sort-direction": "desc",
      });
      node.loadOptions = async () => ({
        items: Array.from({ length: 6 }, (_, i) => ({
          value: i + 1,
          label: `Item ${i + 1}`,
          updated_at: (i + 1) * 10,
        })),
        hasMore: false,
      });
      node.open();
      await flushMicrotasks(5);
      await vi.waitFor(() => {
        expect(optionLabels(node).length).toBe(6);
      });
      const viewport = node
        .getInfiniteScroll()
        ?.querySelector(".infinite-scroll-viewport") as HTMLElement;
      viewport.scrollTop = 90;
      node.close();
      node.open();
      await flushMicrotasks(5);
      await vi.waitFor(() => {
        expect(viewport.scrollTop).toBe(0);
      });
    });

    it("async open → scrollTop 0 after delayed load while panel is open", async () => {
      const node = mount({
        mode: "async",
        debounce: "0",
        "sort-key": "updated_at",
        "sort-direction": "desc",
      });
      let release!: () => void;
      const gate = new Promise<void>((r) => {
        release = r;
      });
      const dirs: string[] = [];
      node.loadOptions = async ({ direction }) => {
        dirs.push(String(direction));
        if (direction === "initial") await gate;
        if (direction === "initial") {
          return {
            items: [
              { value: 1, label: "Low", updated_at: 10 },
              { value: 2, label: "Mid", updated_at: 20 },
              { value: 3, label: "High", updated_at: 30 },
            ],
            hasMore: true,
            nextPage: 2,
          };
        }
        return {
          items: [
            { value: 4, label: "Higher", updated_at: 40 },
            { value: 5, label: "Highest", updated_at: 50 },
          ],
          hasMore: false,
        };
      };

      node.open();
      expect(node.hasAttribute("open")).toBe(true);
      await flushMicrotasks(5);

      const inf = node.getInfiniteScroll()!;
      const viewport = inf.querySelector(
        ".infinite-scroll-viewport",
      ) as HTMLElement;
      // First page fits the scroller → legacy path treated scrollToTop as bottom.
      Object.defineProperty(viewport, "clientHeight", {
        configurable: true,
        get: () => 120,
      });
      Object.defineProperty(viewport, "scrollHeight", {
        configurable: true,
        get: () => (inf.items.length <= 3 ? 120 : 280),
      });

      release();
      await vi.waitFor(() => {
        expect(optionLabels(node)).toContain("High");
      });
      await flushAnimationFrames(4);
      // Allow optional fill-down while staying pinned to top.
      await vi.waitFor(() => {
        expect(viewport.scrollTop).toBe(0);
      });
      await flushAnimationFrames(4);
      expect(viewport.scrollTop).toBe(0);
      // desc: fill-down may insert higher keys above; top row stays the head.
      expect(optionLabels(node)[0]).toMatch(/^High/);
      expect(dirs[0]).toBe("initial");
    });

    it("does not call down after hasMore false", async () => {
      const node = mount({ mode: "async", debounce: "0" });
      const loader = vi.fn(async () => ({
        items: [{ value: 1, label: "Only" }],
        hasMore: false,
      }));
      node.loadOptions = loader;
      node.open();
      await vi.waitFor(() => expect(optionLabels(node)).toContain("Only"));
      const count = loader.mock.calls.length;
      await node.getInfiniteScroll()!.loadDirection("down");
      expect(loader.mock.calls.length).toBe(count);
    });
  });
});
