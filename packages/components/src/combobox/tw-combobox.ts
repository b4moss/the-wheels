import { getEventName, getPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwDropdown } from "../dropdown/tw-dropdown.js";
import {
  TwInfiniteScroll,
  type InfiniteScrollLoader,
} from "../infinite_scroll/tw-infinite-scroll.js";
import { debounce, type DebouncedFn } from "./debounce.js";
import { filterOptionsByQuery, optionLabel } from "./filter.js";
import type {
  ComboboxMode,
  ComboboxOption,
  ComboboxOptionValue,
  LoadOptionsFn,
  LoadOptionsResult,
  RenderOptionFn,
} from "./types.js";

export type {
  ComboboxMode,
  ComboboxOption,
  ComboboxOptionValue,
  LoadOptionsContext,
  LoadOptionsFn,
  LoadOptionsResult,
  RenderOptionFn,
} from "./types.js";

const DEFAULT_DEBOUNCE_MS = 300;
const MODES = new Set<ComboboxMode>(["static", "async", "hybrid"]);

function normalizeMode(value: string | null): ComboboxMode {
  if (value && MODES.has(value as ComboboxMode)) return value as ComboboxMode;
  return "static";
}

function normalizeDebounce(value: string | null): number {
  if (value == null || value === "") return DEFAULT_DEBOUNCE_MS;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_DEBOUNCE_MS;
  return n;
}

function normalizeMaxSelected(value: string | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}

function valuesEqual(a: ComboboxOptionValue, b: ComboboxOptionValue): boolean {
  return String(a) === String(b);
}

export class TwCombobox extends HTMLElement {
  static observedAttributes = [
    "open",
    "placement",
    "mode",
    "debounce",
    "multiple",
    "max-selected",
    "disabled",
    "placeholder",
    "sort-key",
    "sort-direction",
    "max-items",
  ];

  loadOptions: LoadOptionsFn | null = null;
  renderOption: RenderOptionFn | null = null;

  #dropdown: TwDropdown | null = null;
  #panelRoot: HTMLElement | null = null;
  #searchInput: HTMLInputElement | null = null;
  #subarea: HTMLElement | null = null;
  #listHost: HTMLElement | null = null;
  #staticList: HTMLUListElement | null = null;
  #infinite: TwInfiniteScroll | null = null;
  #footer: HTMLElement | null = null;
  #loadingEl: HTMLElement | null = null;

  #options: ComboboxOption[] = [];
  #displayed: ComboboxOption[] = [];
  #value: ComboboxOptionValue | ComboboxOptionValue[] | null = null;
  #query = "";
  #loading = false;
  #initialized = false;
  #projecting = false;
  #syncingOpen = false;
  #observer: MutationObserver | null = null;
  #openObserver: MutationObserver | null = null;
  #abort: AbortController | null = null;
  #requestId = 0;
  #pendingApplyId = 0;
  #pendingResolve: ((result: LoadOptionsResult | null) => void) | null = null;
  #debouncedFetch: DebouncedFn<[]> | null = null;
  #debounceMs = DEFAULT_DEBOUNCE_MS;

  #onSearchInput = (): void => {
    this.#query = this.#searchInput?.value ?? "";
    const mode = this.#mode();
    if (mode === "static") {
      this.#renderStaticList();
      return;
    }
    this.#scheduleFetch();
  };

  #onListClick = (event: Event): void => {
    if (this.hasAttribute("disabled")) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const row = target.closest("[data-tw-option]");
    if (!(row instanceof HTMLElement)) return;
    if (row.hasAttribute("data-disabled")) return;
    const raw = row.dataset.value;
    if (raw == null) return;
    // Prefer original typed value from displayed options.
    const opt = this.#findOptionByRaw(raw);
    const value = opt ? opt.value : raw;
    this.#selectValue(value);
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "combobox");
    this.#ensureStructure();
    this.#syncPlacement();
    this.#syncPlaceholder();
    this.#syncDisabled();
    this.#syncOpenFromHost();
    this.#rebuildDebounce();
    this.#syncListMode();
    this.#observeSlots();
    this.#observeDropdownOpen();
    this.#bindEvents();
    queueMicrotask(() => {
      if (!this.isConnected) return;
      this.#projectSlots();
      this.#dropdown?.refreshSlots();
      this.#syncListMode();
      this.#renderCurrentList();
    });
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.#unbindEvents();
    this.#observer?.disconnect();
    this.#observer = null;
    this.#openObserver?.disconnect();
    this.#openObserver = null;
    this.#debouncedFetch?.cancel();
    this.#abortPending();
  }

  attributeChangedCallback(name: string): void {
    if (!this.#initialized && !this.isConnected) return;
    if (!this.#dropdown) {
      if (this.isConnected) this.#ensureStructure();
      else return;
    }

    if (name === "open") this.#syncOpenFromHost();
    if (name === "placement") this.#syncPlacement();
    if (name === "placeholder") this.#syncPlaceholder();
    if (name === "disabled") this.#syncDisabled();
    if (name === "debounce") this.#rebuildDebounce();
    if (
      name === "mode" ||
      name === "sort-key" ||
      name === "sort-direction" ||
      name === "max-items"
    ) {
      this.#syncListMode();
      this.#renderCurrentList();
    }
  }

  get options(): ComboboxOption[] {
    return this.#options.slice();
  }

  set options(value: ComboboxOption[] | null | undefined) {
    this.#options = Array.isArray(value) ? value.slice() : [];
    this.#renderCurrentList();
  }

  get value(): ComboboxOptionValue | ComboboxOptionValue[] | null {
    if (this.hasAttribute("multiple")) {
      return Array.isArray(this.#value) ? this.#value.slice() : [];
    }
    return this.#value;
  }

  set value(next: ComboboxOptionValue | ComboboxOptionValue[] | null) {
    if (this.hasAttribute("multiple")) {
      this.#value = Array.isArray(next) ? next.slice() : next == null ? [] : [next];
    } else {
      this.#value = Array.isArray(next) ? (next[0] ?? null) : next;
    }
    this.#renderCurrentList();
  }

  get query(): string {
    return this.#query;
  }

  get loading(): boolean {
    return this.#loading;
  }

  open(): void {
    if (this.hasAttribute("disabled")) return;
    this.#dropdown?.open();
    this.#writeOpenAttr(true);
    this.#onOpened();
  }

  close(): void {
    this.#dropdown?.close();
    this.#writeOpenAttr(false);
  }

  toggle(): void {
    if (this.hasAttribute("disabled")) return;
    if (this.#dropdown?.hasAttribute("open") || this.hasAttribute("open")) {
      this.close();
    } else {
      this.open();
    }
  }

  /** Second-path response when `loadOptions` is unset. */
  applyLoadResult(result: LoadOptionsResult): void {
    if (this.#pendingApplyId === 0 || !this.#pendingResolve) return;
    if (this.#pendingApplyId !== this.#requestId) return;
    const resolve = this.#pendingResolve;
    this.#pendingApplyId = 0;
    this.#pendingResolve = null;
    this.#setLoading(false);
    resolve(result);
  }

  getDropdown(): TwDropdown | null {
    return this.#dropdown;
  }

  getInfiniteScroll(): TwInfiniteScroll | null {
    return this.#infinite;
  }

  #mode(): ComboboxMode {
    return normalizeMode(this.getAttribute("mode"));
  }

  #ensureStructure(): void {
    if (this.#dropdown) return;

    const tag = `${getPrefix()}dropdown`;
    const dropdown = document.createElement(tag) as TwDropdown;

    const panelRoot = document.createElement("div");
    panelRoot.setAttribute("slot", "panel");
    panelRoot.className = "combobox-panel";

    const search = document.createElement("input");
    search.type = "search";
    search.className = "combobox-search";
    search.autocomplete = "off";

    const subarea = document.createElement("div");
    subarea.className = "combobox-subarea";

    const listHost = document.createElement("div");
    listHost.className = "combobox-list-host";

    const loadingEl = document.createElement("div");
    loadingEl.className = "combobox-loading";
    loadingEl.hidden = true;
    loadingEl.textContent = "Loading…";

    const footer = document.createElement("div");
    footer.className = "combobox-footer";

    panelRoot.append(search, subarea, loadingEl, listHost, footer);

    this.#dropdown = dropdown;
    this.#panelRoot = panelRoot;
    this.#searchInput = search;
    this.#subarea = subarea;
    this.#listHost = listHost;
    this.#loadingEl = loadingEl;
    this.#footer = footer;

    this.#projectSlots();
    dropdown.append(panelRoot);
    this.append(dropdown);
  }

  #bindEvents(): void {
    this.#searchInput?.addEventListener("input", this.#onSearchInput);
    this.#listHost?.addEventListener("click", this.#onListClick);
  }

  #unbindEvents(): void {
    this.#searchInput?.removeEventListener("input", this.#onSearchInput);
    this.#listHost?.removeEventListener("click", this.#onListClick);
  }

  #observeSlots(): void {
    if (this.#observer) return;
    this.#observer = new MutationObserver(() => {
      if (this.#projecting) return;
      this.#projectSlots();
      this.#dropdown?.refreshSlots();
    });
    this.#observer.observe(this, { childList: true });
  }

  #projectSlots(): void {
    if (!this.#dropdown || !this.#panelRoot || this.#projecting) return;
    this.#projecting = true;

    const nodes = Array.from(this.childNodes).filter(
      (node) => node !== this.#dropdown,
    );

    const triggerNodes: Node[] = [];
    const subareaNodes: Node[] = [];
    const footerNodes: Node[] = [];

    for (const node of nodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as Element;
      const slot = el.getAttribute("slot");
      if (slot === "trigger") {
        triggerNodes.push(node);
        continue;
      }
      if (slot === "subarea") {
        subareaNodes.push(node);
        continue;
      }
      if (slot === "footer") {
        footerNodes.push(node);
        continue;
      }
      // Unknown named slots (incl. option templates) stay on host.
    }

    for (const node of triggerNodes) {
      if (node instanceof Element) node.setAttribute("slot", "trigger");
      this.#dropdown.append(node);
    }

    if (this.#subarea && subareaNodes.length) {
      this.#subarea.replaceChildren(...subareaNodes);
    }
    if (this.#footer && footerNodes.length) {
      this.#footer.replaceChildren(...footerNodes);
    }

    if (this.#dropdown.isConnected) {
      this.#dropdown.refreshSlots();
    }

    this.#projecting = false;
  }

  #observeDropdownOpen(): void {
    if (!this.#dropdown || this.#openObserver) return;
    this.#openObserver = new MutationObserver(() => {
      if (this.#syncingOpen || !this.#dropdown) return;
      const open = this.#dropdown.hasAttribute("open");
      this.#writeOpenAttr(open);
      if (open) this.#onOpened();
    });
    this.#openObserver.observe(this.#dropdown, {
      attributes: true,
      attributeFilter: ["open"],
    });
  }

  #writeOpenAttr(open: boolean): void {
    if (this.#syncingOpen) return;
    this.#syncingOpen = true;
    if (open) {
      if (!this.hasAttribute("open")) this.setAttribute("open", "");
    } else if (this.hasAttribute("open")) {
      this.removeAttribute("open");
    }
    this.#syncingOpen = false;
  }

  #syncOpenFromHost(): void {
    if (!this.#dropdown || this.#syncingOpen) return;
    this.#syncingOpen = true;
    if (this.hasAttribute("open")) this.#dropdown.open();
    else this.#dropdown.close();
    this.#syncingOpen = false;
  }

  #syncPlacement(): void {
    if (!this.#dropdown) return;
    const placement = this.getAttribute("placement");
    if (placement == null || placement === "") {
      this.#dropdown.removeAttribute("placement");
    } else {
      this.#dropdown.setAttribute("placement", placement);
    }
  }

  #syncPlaceholder(): void {
    if (!this.#searchInput) return;
    const ph = this.getAttribute("placeholder");
    if (ph == null) this.#searchInput.removeAttribute("placeholder");
    else this.#searchInput.placeholder = ph;
  }

  #syncDisabled(): void {
    const disabled = this.hasAttribute("disabled");
    if (this.#searchInput) this.#searchInput.disabled = disabled;
    if (disabled) this.close();
  }

  #rebuildDebounce(): void {
    this.#debounceMs = normalizeDebounce(this.getAttribute("debounce"));
    this.#debouncedFetch?.cancel();
    this.#debouncedFetch = debounce(() => {
      void this.#runFetch();
    }, this.#debounceMs);
  }

  #scheduleFetch(): void {
    this.#debouncedFetch?.();
  }

  #onOpened(): void {
    const mode = this.#mode();
    if (mode === "static") {
      this.#renderStaticList();
      return;
    }
    // async / hybrid: kick initial load via infinite scroll / fetch
    void this.#runFetch(true);
  }

  #syncListMode(): void {
    this.#ensureStructure();
    if (!this.#listHost) return;
    const mode = this.#mode();

    if (mode === "static") {
      this.#teardownInfinite();
      if (!this.#staticList) {
        const ul = document.createElement("ul");
        ul.className = "combobox-list";
        this.#listHost.replaceChildren(ul);
        this.#staticList = ul;
      } else if (!this.#staticList.isConnected) {
        this.#listHost.replaceChildren(this.#staticList);
      }
      return;
    }

    // async / hybrid → InfiniteScroll
    this.#staticList = null;
    if (!this.#infinite) {
      const tag = `${getPrefix()}infinite-scroll`;
      const inf = document.createElement(tag) as TwInfiniteScroll;
      inf.autoLoad = false;
      this.#forwardInfiniteAttrs(inf);
      inf.loadItems = this.#createInfiniteLoader();
      inf.renderItem = (item) => this.#createOptionNode(item as ComboboxOption);
      this.#listHost.replaceChildren(inf);
      this.#infinite = inf;
    } else {
      this.#forwardInfiniteAttrs(this.#infinite);
      this.#infinite.loadItems = this.#createInfiniteLoader();
      this.#infinite.renderItem = (item) =>
        this.#createOptionNode(item as ComboboxOption);
      if (!this.#infinite.isConnected) {
        this.#listHost.replaceChildren(this.#infinite);
      }
    }
  }

  #teardownInfinite(): void {
    if (!this.#infinite) return;
    this.#infinite.remove();
    this.#infinite = null;
  }

  #forwardInfiniteAttrs(inf: TwInfiniteScroll): void {
    const sortKey = this.getAttribute("sort-key");
    if (sortKey) inf.setAttribute("sort-key", sortKey);
    else inf.setAttribute("sort-key", "value");

    const sortDir = this.getAttribute("sort-direction");
    if (sortDir) inf.setAttribute("sort-direction", sortDir);
    else inf.removeAttribute("sort-direction");

    const maxItems = this.getAttribute("max-items");
    if (maxItems) inf.setAttribute("max-items", maxItems);
    else inf.removeAttribute("max-items");
  }

  #createInfiniteLoader(): InfiniteScrollLoader {
    return async (ctx) => {
      const result = await this.#invokeLoader({
        query: ctx.query,
        page: ctx.page,
        signal: ctx.signal,
        direction: ctx.direction,
      });
      return result ?? { items: [], hasMore: false };
    };
  }

  #renderCurrentList(): void {
    if (this.#mode() === "static") this.#renderStaticList();
    else if (this.#infinite) {
      // Re-render rows for selection highlight
      this.#infinite.renderItem = (item) =>
        this.#createOptionNode(item as ComboboxOption);
      this.#infinite.setItems(this.#infinite.items);
    }
  }

  #renderStaticList(): void {
    this.#syncListMode();
    if (!this.#staticList) return;
    const filtered = filterOptionsByQuery(this.#options, this.#query);
    this.#displayed = filtered;
    const frag = document.createDocumentFragment();
    for (const opt of filtered) {
      const li = document.createElement("li");
      li.className = "combobox-option-wrap";
      li.append(this.#createOptionNode(opt));
      frag.append(li);
    }
    this.#staticList.replaceChildren(frag);
  }

  #createOptionNode(option: ComboboxOption): Node {
    const selected = this.#isSelected(option.value);
    if (this.renderOption) {
      const custom = this.renderOption(option, selected);
      if (custom instanceof HTMLElement) {
        custom.dataset.twOption = "";
        custom.dataset.value = String(option.value);
        if (option.disabled) custom.dataset.disabled = "";
        if (selected) custom.dataset.selected = "";
      }
      return custom;
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "combobox-option";
    btn.dataset.twOption = "";
    btn.dataset.value = String(option.value);
    btn.textContent = optionLabel(option);
    if (option.disabled) {
      btn.disabled = true;
      btn.dataset.disabled = "";
    }
    if (selected) {
      btn.dataset.selected = "";
      btn.setAttribute("aria-selected", "true");
    }
    return btn;
  }

  #isSelected(value: ComboboxOptionValue): boolean {
    if (this.hasAttribute("multiple")) {
      const arr = Array.isArray(this.#value) ? this.#value : [];
      return arr.some((v) => valuesEqual(v, value));
    }
    if (this.#value == null || Array.isArray(this.#value)) return false;
    return valuesEqual(this.#value, value);
  }

  #findOptionByRaw(raw: string): ComboboxOption | undefined {
    const fromDisplayed = this.#displayed.find(
      (o) => String(o.value) === raw,
    );
    if (fromDisplayed) return fromDisplayed;
    const fromOptions = this.#options.find((o) => String(o.value) === raw);
    if (fromOptions) return fromOptions;
    const fromInfinite = this.#infinite?.items.find(
      (o) => String(o.value) === raw,
    ) as ComboboxOption | undefined;
    return fromInfinite;
  }

  #selectValue(value: ComboboxOptionValue): void {
    if (this.hasAttribute("multiple")) {
      const current = Array.isArray(this.#value) ? this.#value.slice() : [];
      const idx = current.findIndex((v) => valuesEqual(v, value));
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        const max = normalizeMaxSelected(this.getAttribute("max-selected"));
        if (max != null && current.length >= max) return;
        current.push(value);
      }
      this.#value = current;
    } else {
      this.#value = value;
      this.close();
    }
    this.#renderCurrentList();
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  #setLoading(loading: boolean): void {
    this.#loading = loading;
    if (this.#loadingEl) this.#loadingEl.hidden = !loading;
    if (loading) this.setAttribute("loading", "");
    else this.removeAttribute("loading");
  }

  #abortPending(): void {
    this.#abort?.abort();
    this.#abort = null;
    if (this.#pendingResolve) {
      this.#pendingResolve(null);
      this.#pendingResolve = null;
    }
    this.#pendingApplyId = 0;
  }

  async #runFetch(isOpenKick = false): Promise<void> {
    const mode = this.#mode();
    if (mode === "static") return;

    this.#syncListMode();
    if (!this.#infinite) return;

    const seed =
      mode === "hybrid" && this.#options.length ? this.#options.slice() : undefined;

    // hybrid + options only (no loadOptions): show seed, skip fetch.
    if (!this.loadOptions && mode === "hybrid") {
      this.#infinite.setItems(seed ?? []);
      this.#displayed = this.#infinite.items as ComboboxOption[];
      this.#setLoading(false);
      return;
    }

    this.#setLoading(true);
    try {
      await this.#infinite.reset({ query: this.#query, seed });
      this.#displayed = this.#infinite.items as ComboboxOption[];
    } finally {
      this.#setLoading(false);
    }

    // Async has no seed: panel opens empty, then rows paint after await. Loading
    // chrome also toggles height after reset returns — re-pin to top once open
    // layout/paint have settled (InfiniteScroll already rAF-scrolls on initial).
    if (isOpenKick || this.hasAttribute("open")) {
      this.#infinite.scrollToTop();
    }
  }

  async #invokeLoader(
    ctx: {
      query: string;
      page: number | string;
      signal: AbortSignal;
      direction?: "initial" | "up" | "down";
    },
  ): Promise<LoadOptionsResult | null> {
    if (this.loadOptions) {
      try {
        return await this.loadOptions(ctx);
      } catch {
        return null;
      }
    }

    // Second path: custom event + applyLoadResult
    if (this.#pendingResolve) {
      this.#pendingResolve(null);
      this.#pendingResolve = null;
    }
    const requestId = ++this.#requestId;
    this.#pendingApplyId = requestId;
    this.#setLoading(true);

    return await new Promise<LoadOptionsResult | null>((resolve) => {
      const onAbort = (): void => {
        if (this.#pendingApplyId === requestId) {
          this.#pendingApplyId = 0;
          const r = this.#pendingResolve;
          this.#pendingResolve = null;
          this.#setLoading(false);
          r?.(null);
        }
      };

      this.#pendingResolve = (result) => {
        ctx.signal.removeEventListener("abort", onAbort);
        resolve(result);
      };

      ctx.signal.addEventListener("abort", onAbort, { once: true });

      this.dispatchEvent(
        new CustomEvent(getEventName("load-request"), {
          bubbles: true,
          detail: {
            query: ctx.query,
            page: ctx.page,
            signal: ctx.signal,
            direction: ctx.direction,
          },
        }),
      );

      // If no sync listener called applyLoadResult, clear loading (timeout相当).
      queueMicrotask(() => {
        if (this.#pendingApplyId !== requestId || !this.#pendingResolve) return;
        this.#pendingApplyId = 0;
        const r = this.#pendingResolve;
        this.#pendingResolve = null;
        ctx.signal.removeEventListener("abort", onAbort);
        this.#setLoading(false);
        r(null);
      });
    });
  }
}

defineComponent("combobox", TwCombobox);
