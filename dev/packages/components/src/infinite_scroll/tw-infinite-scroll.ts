import { defineComponent } from "../core/register.js";
import {
  DEFAULT_MAX_ITEMS,
  mergeWindowItems,
  normalizeMaxItems,
  normalizeSortDirection,
  trimWindowItems,
  type SortDirection,
  type WindowItem,
} from "./window.js";

export type InfiniteScrollDirection = "initial" | "up" | "down";

export type InfiniteScrollLoadContext = {
  query: string;
  page: number | string;
  signal: AbortSignal;
  direction: InfiniteScrollDirection;
};

export type InfiniteScrollLoadResult<T extends WindowItem = WindowItem> = {
  items: T[];
  hasMore: boolean;
  nextPage?: number | string;
};

export type InfiniteScrollLoader<T extends WindowItem = WindowItem> = (
  ctx: InfiniteScrollLoadContext,
) => Promise<InfiniteScrollLoadResult<T>> | InfiniteScrollLoadResult<T>;

export type RenderItemFn<T extends WindowItem = WindowItem> = (
  item: T,
) => Node;

const SCROLL_EDGE_PX = 24;

export class TwInfiniteScroll extends HTMLElement {
  static observedAttributes = ["sort-key", "sort-direction", "max-items"];

  loadItems: InfiniteScrollLoader | null = null;
  renderItem: RenderItemFn | null = null;
  /** When false, connectedCallback will not call refresh() automatically. */
  autoLoad = true;

  #viewport: HTMLElement | null = null;
  #list: HTMLElement | null = null;
  #initialized = false;
  #items: WindowItem[] = [];
  #query = "";
  #loading = false;
  #hasMoreDown = true;
  #hasMoreUp = false;
  #nextPageDown: number | string = 1;
  #nextPageUp: number | string = 1;
  #abort: AbortController | null = null;
  #requestId = 0;
  #didInitial = false;
  /** Skip edge fetches while we programmatically reset scroll (open / initial). */
  #suppressEdgeChecks = false;
  #scrollTopRaf = 0;

  #onScroll = (): void => {
    if (this.#suppressEdgeChecks) return;
    this.#checkEdges();
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "infinite-scroll");
    this.#ensureStructure();
    this.#viewport?.addEventListener("scroll", this.#onScroll, {
      passive: true,
    });
    this.#initialized = true;
    queueMicrotask(() => {
      if (!this.isConnected || !this.autoLoad) return;
      if (!this.#didInitial) void this.refresh();
    });
  }

  disconnectedCallback(): void {
    this.#viewport?.removeEventListener("scroll", this.#onScroll);
    if (this.#scrollTopRaf) {
      cancelAnimationFrame(this.#scrollTopRaf);
      this.#scrollTopRaf = 0;
    }
    this.#suppressEdgeChecks = false;
    this.#abortPending();
  }

  attributeChangedCallback(): void {
    if (!this.#initialized) return;
    // Re-sort / re-trim current window when sort/max attrs change.
    this.#reapplyWindow();
    this.#renderList();
  }

  get items(): WindowItem[] {
    return this.#items.slice();
  }

  get query(): string {
    return this.#query;
  }

  get loading(): boolean {
    return this.#loading;
  }

  /** Seed / replace window without fetching. */
  setItems(items: WindowItem[]): void {
    this.#items = this.#sortAndTrim(items, "start");
    this.#renderList();
  }

  async refresh(): Promise<void> {
    this.#didInitial = true;
    await this.#load("initial");
  }

  async reset(opts: { query?: string; seed?: WindowItem[] } = {}): Promise<void> {
    this.#abortPending();
    this.#query = opts.query ?? "";
    this.#hasMoreDown = true;
    this.#hasMoreUp = false;
    this.#nextPageDown = 1;
    this.#nextPageUp = 1;
    this.#items = opts.seed ? this.#sortAndTrim(opts.seed, "start") : [];
    this.#renderList();
    // Query / window replace must start at the top — do not keep prior scrollTop.
    this.#scrollToTop();
    this.#didInitial = true;
    await this.#load("initial");
  }

  /** Test / imperative hook for edge loads. */
  async loadDirection(direction: "up" | "down"): Promise<void> {
    await this.#load(direction);
  }

  /**
   * Pin the viewport to the top after layout. Used on open / initial reload so
   * content height growth (async empty→rows) cannot leave scroll at the end.
   */
  scrollToTop(): void {
    this.#scrollToTop(true);
  }

  #ensureStructure(): void {
    if (this.#viewport && this.#list) return;

    let viewport = this.querySelector(
      ":scope > .infinite-scroll-viewport",
    ) as HTMLElement | null;
    if (!viewport) {
      viewport = document.createElement("div");
      viewport.className = "infinite-scroll-viewport";
      this.append(viewport);
    }

    let list = viewport.querySelector(
      ":scope > .infinite-scroll-list",
    ) as HTMLElement | null;
    if (!list) {
      list = document.createElement("ul");
      list.className = "infinite-scroll-list";
      viewport.append(list);
    }

    this.#viewport = viewport;
    this.#list = list;
  }

  #sortKey(): string {
    return this.getAttribute("sort-key")?.trim() || "value";
  }

  #sortDirection(): SortDirection {
    return normalizeSortDirection(this.getAttribute("sort-direction"));
  }

  #maxItems(): number {
    return normalizeMaxItems(this.getAttribute("max-items"));
  }

  #sortAndTrim(
    items: WindowItem[],
    overflowEdge: "start" | "end",
  ): WindowItem[] {
    const sorted = mergeWindowItems(
      [],
      items,
      this.#sortKey(),
      this.#sortDirection(),
    );
    return trimWindowItems(sorted, this.#maxItems(), overflowEdge);
  }

  #reapplyWindow(): void {
    this.#items = this.#sortAndTrim(this.#items, "start");
  }

  #abortPending(): void {
    this.#abort?.abort();
    this.#abort = null;
  }

  #checkEdges(): void {
    const vp = this.#viewport;
    if (!vp || this.#loading) return;
    const { scrollTop, scrollHeight, clientHeight } = vp;
    // Not laid out yet (hidden panel / happy-dom defaults) — avoid false bottom.
    if (clientHeight <= 0) return;
    if (scrollTop + clientHeight >= scrollHeight - SCROLL_EDGE_PX) {
      void this.#load("down");
    }
    if (scrollTop <= SCROLL_EDGE_PX) {
      void this.#load("up");
    }
  }

  async #load(direction: InfiniteScrollDirection): Promise<void> {
    if (direction === "down" && !this.#hasMoreDown) return;
    if (direction === "up" && !this.#hasMoreUp) return;
    if (this.#loading && direction !== "initial") return;

    const loader = this.loadItems;
    if (!loader) {
      if (direction === "initial") {
        this.#loading = false;
        this.#syncLoadingAttr();
        this.#renderList();
        this.#scrollToTop();
      }
      return;
    }

    this.#abortPending();
    const ac = new AbortController();
    this.#abort = ac;
    const requestId = ++this.#requestId;
    this.#loading = true;
    this.#syncLoadingAttr();

    const page =
      direction === "up"
        ? this.#nextPageUp
        : direction === "down"
          ? this.#nextPageDown
          : 1;

    // Anchor restore is for up/down pagination only. On initial (open / query
    // reset / hybrid seed merge), restoring a pre-load row scrolls the viewport
    // to mid/bottom when new sorted items land above that row.
    // Async open also: first page often fits the viewport, so scrollToTop fires a
    // scroll event that looks like the bottom edge → down fetch. Desc merge then
    // inserts above the anchor and restoreAnchor leaves the list at the end.
    const stayAtTop =
      direction === "down" &&
      this.#viewport != null &&
      this.#viewport.scrollTop <= SCROLL_EDGE_PX;
    const anchor =
      direction === "initial" || stayAtTop ? null : this.#captureAnchor();

    try {
      const result = await loader({
        query: this.#query,
        page,
        signal: ac.signal,
        direction,
      });
      if (requestId !== this.#requestId || ac.signal.aborted) return;

      const overflowEdge: "start" | "end" =
        direction === "up" ? "end" : "start";

      const merged = mergeWindowItems(
        this.#items,
        result.items ?? [],
        this.#sortKey(),
        this.#sortDirection(),
      );
      this.#items = trimWindowItems(merged, this.#maxItems(), overflowEdge);

      if (direction === "up") {
        this.#hasMoreUp = Boolean(result.hasMore);
        if (result.nextPage != null) this.#nextPageUp = result.nextPage;
        else if (typeof this.#nextPageUp === "number") this.#nextPageUp += 1;
      } else if (direction === "down") {
        this.#hasMoreDown = Boolean(result.hasMore);
        if (result.nextPage != null) this.#nextPageDown = result.nextPage;
        else if (typeof this.#nextPageDown === "number") this.#nextPageDown += 1;
      } else {
        this.#hasMoreDown = Boolean(result.hasMore);
        if (result.nextPage != null) this.#nextPageDown = result.nextPage;
        else this.#nextPageDown = 2;
      }

      // Trimmed edge can be fetched again when user scrolls back.
      if (direction === "down" && merged.length > this.#items.length) {
        this.#hasMoreUp = true;
      }
      if (direction === "up" && merged.length > this.#items.length) {
        this.#hasMoreDown = true;
      }

      this.#renderList();
      if (direction === "initial" || stayAtTop) {
        // Async open: empty → rows (and any fill-down while still at top) must
        // pin to 0 after layout; sync assign can run before scrollHeight grows.
        this.#scrollToTop(true);
      } else {
        this.#restoreAnchor(anchor);
      }
    } catch {
      // Swallow loader rejection; keep previous items.
      if (requestId !== this.#requestId) return;
    } finally {
      if (requestId === this.#requestId) {
        this.#loading = false;
        this.#syncLoadingAttr();
        this.#abort = null;
      }
    }
  }

  #syncLoadingAttr(): void {
    if (this.#loading) this.setAttribute("loading", "");
    else this.removeAttribute("loading");
  }

  #renderList(): void {
    this.#ensureStructure();
    if (!this.#list) return;
    const frag = document.createDocumentFragment();
    for (const item of this.#items) {
      const li = document.createElement("li");
      li.className = "infinite-scroll-item";
      li.dataset.value = String(item.value);
      if (this.renderItem) {
        li.append(this.renderItem(item));
      } else {
        const label =
          typeof item.label === "string" ? item.label : String(item.value);
        li.textContent = label;
      }
      frag.append(li);
    }
    this.#list.replaceChildren(frag);
  }

  #scrollToTop(afterLayout = false): void {
    const vp = this.#viewport;
    if (!vp) return;

    this.#suppressEdgeChecks = true;
    vp.scrollTop = 0;

    if (this.#scrollTopRaf) {
      cancelAnimationFrame(this.#scrollTopRaf);
      this.#scrollTopRaf = 0;
    }

    if (!afterLayout) {
      // Keep suppression until the scroll event from this assign has settled.
      queueMicrotask(() => {
        this.#suppressEdgeChecks = false;
      });
      return;
    }

    // Double rAF: wait until list rows have contributed to scrollHeight (async
    // empty→paint, or panel just un-hidden) before re-asserting scrollTop.
    this.#scrollTopRaf = requestAnimationFrame(() => {
      this.#scrollTopRaf = requestAnimationFrame(() => {
        this.#scrollTopRaf = 0;
        if (this.#viewport) this.#viewport.scrollTop = 0;
        this.#suppressEdgeChecks = false;
        // First page often fits the viewport (async kitchen-sink). Without a
        // user scroll, hasMore would be stuck; fill while stayAtTop keeps pin.
        this.#checkEdges();
      });
    });
  }

  #captureAnchor(): { value: string; offset: number } | null {
    const vp = this.#viewport;
    if (!vp) return null;
    const children = Array.from(
      this.#list?.querySelectorAll<HTMLElement>(":scope > .infinite-scroll-item") ??
        [],
    );
    for (const child of children) {
      const top = child.offsetTop - vp.scrollTop;
      if (top + child.offsetHeight > 0) {
        return {
          value: child.dataset.value ?? "",
          offset: top,
        };
      }
    }
    return null;
  }

  #restoreAnchor(
    anchor: { value: string; offset: number } | null,
  ): void {
    const vp = this.#viewport;
    if (!vp || !anchor) return;
    const el = this.#list?.querySelector<HTMLElement>(
      `:scope > .infinite-scroll-item[data-value="${CSS.escape(anchor.value)}"]`,
    );
    if (!el) return;
    const nextTop = el.offsetTop - anchor.offset;
    vp.scrollTop = Math.max(0, nextTop);
  }
}

defineComponent("infinite-scroll", TwInfiniteScroll);
