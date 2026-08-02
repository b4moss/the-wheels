import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrefix, setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwInfiniteScroll } from "./tw-infinite-scroll.js";
import { DEFAULT_MAX_ITEMS } from "./window.js";

function tag(): string {
  return `${getPrefix()}infinite-scroll`;
}

function mount(
  attrs: Record<string, string> = {},
): TwInfiniteScroll {
  const node = document.createElement(tag()) as TwInfiniteScroll;
  node.autoLoad = false;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === "") node.setAttribute(key, "");
    else node.setAttribute(key, value);
  }
  document.body.append(node);
  return node;
}

describe("TwInfiniteScroll", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("infinite-scroll", TwInfiniteScroll);
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  describe("data-tw-component", () => {
    it("sets data-tw-component=infinite-scroll on connect", () => {
      const node = mount();
      expect(node.getAttribute("data-tw-component")).toBe("infinite-scroll");
    });

    it("keeps data-tw-component under a custom prefix", () => {
      setPrefix("app");
      defineComponent("infinite-scroll", TwInfiniteScroll);
      const node = document.createElement(
        "app-infinite-scroll",
      ) as TwInfiniteScroll;
      node.autoLoad = false;
      document.body.append(node);
      expect(node.getAttribute("data-tw-component")).toBe("infinite-scroll");
    });
  });

  describe("initial load", () => {
    it("calls loader with direction=initial and sorts by sort-key", async () => {
      const node = mount({ "sort-key": "updated_at", "sort-direction": "desc" });
      const loader = vi.fn(async () => ({
        items: [
          { value: 1, label: "a", updated_at: 10 },
          { value: 2, label: "b", updated_at: 30 },
          { value: 3, label: "c", updated_at: 20 },
        ],
        hasMore: true,
      }));
      node.loadItems = loader;
      await node.refresh();
      expect(loader).toHaveBeenCalledWith(
        expect.objectContaining({ direction: "initial", page: 1 }),
      );
      expect(node.items.map((i) => i.value)).toEqual([2, 3, 1]);
    });

    it("does not throw when loader is unset", async () => {
      const node = mount();
      await expect(node.refresh()).resolves.toBeUndefined();
      expect(node.items).toEqual([]);
    });

    it("keeps previous items when loader rejects", async () => {
      const node = mount({ "sort-key": "updated_at" });
      node.loadItems = async () => ({
        items: [{ value: 1, updated_at: 1 }],
        hasMore: false,
      });
      await node.refresh();
      node.loadItems = async () => {
        throw new Error("boom");
      };
      await node.loadDirection("down");
      expect(node.items.map((i) => i.value)).toEqual([1]);
    });

    it("does not load more when hasMore is false", async () => {
      const node = mount();
      const loader = vi.fn(async () => ({
        items: [{ value: 1, label: "a" }],
        hasMore: false,
      }));
      node.loadItems = loader;
      await node.refresh();
      await node.loadDirection("down");
      expect(loader).toHaveBeenCalledTimes(1);
    });
  });

  describe("edge loads", () => {
    it("loads down and grows window", async () => {
      const node = mount({ "sort-key": "updated_at", "max-items": "10" });
      let page = 0;
      node.loadItems = async ({ direction }) => {
        if (direction === "initial") {
          page = 1;
          return {
            items: [{ value: 1, updated_at: 10 }],
            hasMore: true,
            nextPage: 2,
          };
        }
        page += 1;
        return {
          items: [{ value: page, updated_at: 10 + page }],
          hasMore: true,
          nextPage: page + 1,
        };
      };
      await node.refresh();
      await node.loadDirection("down");
      expect(node.items.length).toBeGreaterThan(1);
    });

    it("loads up when hasMoreUp after trim", async () => {
      const node = mount({
        "sort-key": "updated_at",
        "sort-direction": "desc",
        "max-items": "2",
      });
      const calls: string[] = [];
      node.loadItems = async ({ direction }) => {
        calls.push(direction);
        if (direction === "initial") {
          return {
            items: [
              { value: "a", updated_at: 30 },
              { value: "b", updated_at: 20 },
            ],
            hasMore: true,
          };
        }
        if (direction === "down") {
          return {
            items: [{ value: "c", updated_at: 10 }],
            hasMore: true,
          };
        }
        return {
          items: [{ value: "z", updated_at: 40 }],
          hasMore: false,
        };
      };
      await node.refresh();
      await node.loadDirection("down");
      // window trimmed from top → hasMoreUp
      expect(node.items).toHaveLength(2);
      await node.loadDirection("up");
      expect(calls).toContain("up");
      expect(node.items.some((i) => i.value === "z")).toBe(true);
    });

    it("ignores re-entry while loading", async () => {
      const node = mount();
      let resolve!: (v: {
        items: { value: number }[];
        hasMore: boolean;
      }) => void;
      const loader = vi.fn(
        () =>
          new Promise<{ items: { value: number }[]; hasMore: boolean }>((r) => {
            resolve = r;
          }),
      );
      node.loadItems = loader;
      const p1 = node.refresh();
      const p2 = node.loadDirection("down");
      resolve({ items: [{ value: 1 }], hasMore: true });
      await Promise.all([p1, p2]);
      // down ignored while initial in-flight (loading gate)
      expect(loader.mock.calls.length).toBe(1);
    });
  });

  describe("attributes", () => {
    it("defaults sort-direction=desc and max-items=100", async () => {
      const node = mount({ "sort-key": "n" });
      node.loadItems = async () => ({
        items: [
          { value: 1, n: 1 },
          { value: 2, n: 2 },
        ],
        hasMore: false,
      });
      await node.refresh();
      expect(node.items.map((i) => i.value)).toEqual([2, 1]);
      expect(DEFAULT_MAX_ITEMS).toBe(100);
    });

    it("falls back invalid sort-direction to desc", async () => {
      const node = mount({ "sort-key": "n", "sort-direction": "nope" });
      node.loadItems = async () => ({
        items: [
          { value: 1, n: 1 },
          { value: 2, n: 2 },
        ],
        hasMore: false,
      });
      await node.refresh();
      expect(node.items.map((i) => i.value)).toEqual([2, 1]);
    });

    it("falls back invalid max-items to 100", () => {
      const node = mount({ "max-items": "abc" });
      // Fill more than a tiny window would allow; with fallback 100 all fit.
      node.setItems(
        Array.from({ length: 5 }, (_, i) => ({ value: i, n: i })),
      );
      expect(node.items).toHaveLength(5);
    });

    it("respects max-items=5", async () => {
      const node = mount({
        "sort-key": "n",
        "sort-direction": "asc",
        "max-items": "5",
      });
      node.loadItems = async () => ({
        items: Array.from({ length: 8 }, (_, i) => ({ value: i, n: i })),
        hasMore: false,
      });
      await node.refresh();
      expect(node.items).toHaveLength(5);
    });
  });

  describe("reset", () => {
    it("clears items and reloads with new query", async () => {
      const node = mount();
      const queries: string[] = [];
      node.loadItems = async ({ query, direction }) => {
        queries.push(`${direction}:${query}`);
        return {
          items: [{ value: query || "empty", label: query }],
          hasMore: false,
        };
      };
      await node.refresh();
      await node.reset({ query: "hello" });
      expect(queries).toContain("initial:hello");
      expect(node.items[0]?.value).toBe("hello");
    });

    it("discards in-flight result after reset", async () => {
      const node = mount();
      let release!: () => void;
      const gate = new Promise<void>((r) => {
        release = r;
      });
      let call = 0;
      node.loadItems = async ({ query }) => {
        call += 1;
        if (call === 1) {
          await gate;
          return { items: [{ value: "stale" }], hasMore: false };
        }
        return { items: [{ value: query }], hasMore: false };
      };
      const first = node.refresh();
      const second = node.reset({ query: "fresh" });
      release();
      await Promise.all([first, second]);
      expect(node.items.map((i) => i.value)).toEqual(["fresh"]);
    });
  });

  describe("scroll anchor", () => {
    it("keeps anchor offset roughly after down merge", async () => {
      const node = mount({
        "sort-key": "n",
        "sort-direction": "asc",
        "max-items": "20",
      });
      const viewport = node.querySelector(
        ".infinite-scroll-viewport",
      ) as HTMLElement;
      // Give the viewport a layout box for offset math in happy-dom.
      Object.defineProperty(viewport, "clientHeight", {
        configurable: true,
        get: () => 100,
      });
      Object.defineProperty(viewport, "scrollHeight", {
        configurable: true,
        get: () => 400,
      });

      node.loadItems = async ({ direction }) => {
        if (direction === "initial") {
          return {
            items: Array.from({ length: 5 }, (_, i) => ({
              value: `i${i}`,
              n: i,
              label: `Item ${i}`,
            })),
            hasMore: true,
          };
        }
        return {
          items: Array.from({ length: 3 }, (_, i) => ({
            value: `d${i}`,
            n: 10 + i,
            label: `Down ${i}`,
          })),
          hasMore: false,
        };
      };
      await node.refresh();

      const list = node.querySelector(".infinite-scroll-list") as HTMLElement;
      const children = Array.from(list.children) as HTMLElement[];
      children.forEach((el, i) => {
        Object.defineProperty(el, "offsetTop", {
          configurable: true,
          get: () => i * 40,
        });
        Object.defineProperty(el, "offsetHeight", {
          configurable: true,
          get: () => 40,
        });
      });
      viewport.scrollTop = 40;
      const anchor = children[1]!;
      const before = anchor.offsetTop - viewport.scrollTop;

      await node.loadDirection("down");

      const afterEl = list.querySelector(
        `[data-value="${anchor.dataset.value}"]`,
      ) as HTMLElement | null;
      expect(afterEl).not.toBeNull();
      // Re-stub offsets after re-render
      const afterChildren = Array.from(list.children) as HTMLElement[];
      afterChildren.forEach((el, i) => {
        Object.defineProperty(el, "offsetTop", {
          configurable: true,
          get: () => i * 40,
        });
        Object.defineProperty(el, "offsetHeight", {
          configurable: true,
          get: () => 40,
        });
      });
      const after = afterEl!.offsetTop - viewport.scrollTop;
      expect(Math.abs(after - before)).toBeLessThanOrEqual(40);
    });

    it("scrolls to top after initial load even with seed rows above", async () => {
      const node = mount({
        "sort-key": "n",
        "sort-direction": "desc",
      });
      const viewport = node.querySelector(
        ".infinite-scroll-viewport",
      ) as HTMLElement;
      Object.defineProperty(viewport, "clientHeight", {
        configurable: true,
        get: () => 80,
      });
      Object.defineProperty(viewport, "scrollHeight", {
        configurable: true,
        get: () => 400,
      });

      node.loadItems = async () => ({
        items: [
          { value: "hi", n: 100, label: "High" },
          { value: "mid", n: 50, label: "Mid" },
        ],
        hasMore: false,
      });

      // Seed sits at the sort tail; old anchor restore would scroll it into view.
      await node.reset({
        seed: [{ value: "seed", n: 1, label: "Seed" }],
      });

      const list = node.querySelector(".infinite-scroll-list") as HTMLElement;
      Array.from(list.children).forEach((el, i) => {
        Object.defineProperty(el, "offsetTop", {
          configurable: true,
          get: () => i * 40,
        });
        Object.defineProperty(el, "offsetHeight", {
          configurable: true,
          get: () => 40,
        });
      });

      expect(viewport.scrollTop).toBe(0);
      expect(node.items.map((i) => i.value)).toEqual(["hi", "mid", "seed"]);
    });

    it("resets scrollTop to 0 on query reset after user scrolled", async () => {
      const node = mount({ "sort-key": "n", "sort-direction": "asc" });
      const viewport = node.querySelector(
        ".infinite-scroll-viewport",
      ) as HTMLElement;
      node.loadItems = async ({ query }) => ({
        items: Array.from({ length: 8 }, (_, i) => ({
          value: `${query}-${i}`,
          n: i,
          label: `${query} ${i}`,
        })),
        hasMore: false,
      });
      await node.refresh();
      viewport.scrollTop = 120;
      await node.reset({ query: "next" });
      expect(viewport.scrollTop).toBe(0);
    });

    it("keeps scrollTop 0 when short initial page fill-downs with desc insert-above", async () => {
      const node = mount({
        "sort-key": "n",
        "sort-direction": "desc",
      });
      const viewport = node.querySelector(
        ".infinite-scroll-viewport",
      ) as HTMLElement;
      const dirs: string[] = [];
      node.loadItems = async ({ direction }) => {
        dirs.push(direction);
        if (direction === "initial") {
          return {
            items: [
              { value: "a", n: 1, label: "A" },
              { value: "b", n: 2, label: "B" },
            ],
            hasMore: true,
            nextPage: 2,
          };
        }
        return {
          items: [
            { value: "c", n: 10, label: "C-high" },
            { value: "d", n: 9, label: "D-high" },
          ],
          hasMore: false,
        };
      };

      Object.defineProperty(viewport, "clientHeight", {
        configurable: true,
        get: () => 80,
      });
      Object.defineProperty(viewport, "scrollHeight", {
        configurable: true,
        get: () => (node.items.length <= 2 ? 80 : 200),
      });

      await node.refresh();
      // Layout rAF + optional fill-down while stayAtTop.
      for (let i = 0; i < 6; i++) {
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }
      await vi.waitFor(() => {
        expect(dirs).toContain("down");
        expect(node.items.map((i) => i.value)[0]).toBe("c");
      });
      expect(viewport.scrollTop).toBe(0);
    });
  });
});
