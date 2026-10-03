import { getEventName } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";

let tabsIdSeq = 0;

export class TwTabs extends HTMLElement {
  static observedAttributes = ["selected-index"];

  #list: HTMLElement | null = null;
  #panelsRoot: HTMLElement | null = null;
  #tabs: HTMLButtonElement[] = [];
  #panels: HTMLElement[] = [];
  #selected = 0;
  #initialized = false;
  #projecting = false;
  #observer: MutationObserver | null = null;
  #baseId = "";

  #onClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const tab = target.closest("[data-tw-tab]");
    if (!(tab instanceof HTMLButtonElement)) return;
    if (!this.#list?.contains(tab)) return;
    const index = this.#tabs.indexOf(tab);
    if (index >= 0) this.select(index);
  };

  #onKeydown = (event: KeyboardEvent): void => {
    if (!(event.target instanceof Element)) return;
    if (!this.#list?.contains(event.target)) return;
    const { key } = event;
    if (
      key !== "ArrowLeft" &&
      key !== "ArrowRight" &&
      key !== "Home" &&
      key !== "End"
    ) {
      return;
    }
    if (this.#tabs.length === 0) return;
    event.preventDefault();

    let next = this.#selected;
    if (key === "ArrowLeft") {
      next = (this.#selected - 1 + this.#tabs.length) % this.#tabs.length;
    } else if (key === "ArrowRight") {
      next = (this.#selected + 1) % this.#tabs.length;
    } else if (key === "Home") {
      next = 0;
    } else {
      next = this.#tabs.length - 1;
    }
    this.select(next);
    this.#tabs[next]?.focus();
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "tabs");
    if (!this.#baseId) {
      tabsIdSeq += 1;
      this.#baseId = `tw-tabs-${tabsIdSeq}`;
    }
    this.#ensureStructure();
    this.#projectSlots();
    this.#readInitialIndex();
    this.#syncSelection();
    this.#list?.addEventListener("click", this.#onClick);
    this.#list?.addEventListener("keydown", this.#onKeydown);
    this.#observeSlots();
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.#list?.removeEventListener("click", this.#onClick);
    this.#list?.removeEventListener("keydown", this.#onKeydown);
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback(name: string): void {
    if (!this.#initialized && !this.isConnected) return;
    if (name === "selected-index") {
      this.#readInitialIndex();
      this.#syncSelection();
    }
  }

  select(index: number): void {
    if (!Number.isFinite(index)) return;
    if (this.#tabs.length === 0) return;
    const max = Math.max(this.#tabs.length - 1, 0);
    const next = Math.max(0, Math.min(Math.trunc(index), max));
    const prev = this.#selected;
    this.#selected = next;
    if (this.getAttribute("selected-index") !== String(next)) {
      this.setAttribute("selected-index", String(next));
    }
    this.#syncSelection();
    if (next !== prev) {
      this.dispatchEvent(
        new CustomEvent(getEventName("change"), {
          bubbles: true,
          detail: { selectedIndex: next },
        }),
      );
    }
  }

  get selectedIndex(): number {
    return this.#selected;
  }

  #ensureStructure(): void {
    if (this.#list && this.#panelsRoot) return;

    const list = document.createElement("div");
    list.className = "tabs-list";
    list.setAttribute("role", "tablist");

    const panels = document.createElement("div");
    panels.className = "tabs-panels";

    this.append(list, panels);
    this.#list = list;
    this.#panelsRoot = panels;
  }

  #observeSlots(): void {
    if (this.#observer) return;
    this.#observer = new MutationObserver(() => {
      if (this.#projecting) return;
      this.#projectSlots();
      this.#readInitialIndex();
      this.#syncSelection();
    });
    this.#observer.observe(this, { childList: true });
  }

  #projectSlots(): void {
    if (!this.#list || !this.#panelsRoot || this.#projecting) return;
    this.#projecting = true;

    const nodes = Array.from(this.childNodes).filter(
      (node) => node !== this.#list && node !== this.#panelsRoot,
    );

    const tabNodes: Element[] = [];
    const panelNodes: Element[] = [];

    for (const node of nodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as Element;
      const slot = el.getAttribute("slot");
      if (slot === "tab") tabNodes.push(el);
      else if (slot === "panel") panelNodes.push(el);
    }

    // Nothing new to project — keep current tabs/panels.
    if (tabNodes.length === 0 && panelNodes.length === 0) {
      this.#projecting = false;
      return;
    }

    this.#tabs = [];
    this.#list.replaceChildren();
    for (let i = 0; i < tabNodes.length; i++) {
      const button = this.#ensureTabButton(tabNodes[i]!, i);
      this.#list.append(button);
      this.#tabs.push(button);
    }

    this.#panels = [];
    this.#panelsRoot.replaceChildren();
    for (let i = 0; i < panelNodes.length; i++) {
      const source = panelNodes[i]!;
      source.removeAttribute("slot");
      source.classList.add("tabs-panel");
      source.setAttribute("role", "tabpanel");
      const panelId = `${this.#baseId}-panel-${i}`;
      if (!source.id) source.id = panelId;
      const tabId = this.#tabs[i]?.id ?? `${this.#baseId}-tab-${i}`;
      source.setAttribute("aria-labelledby", tabId);
      this.#panelsRoot.append(source);
      this.#panels.push(source as HTMLElement);
    }

    for (let i = 0; i < this.#tabs.length; i++) {
      const panel = this.#panels[i];
      if (panel) this.#tabs[i]!.setAttribute("aria-controls", panel.id);
    }

    for (const node of Array.from(this.childNodes)) {
      if (node === this.#list || node === this.#panelsRoot) continue;
      node.parentNode?.removeChild(node);
    }

    this.#projecting = false;
  }

  #ensureTabButton(source: Element, index: number): HTMLButtonElement {
    let button: HTMLButtonElement;
    if (source instanceof HTMLButtonElement) {
      button = source;
      button.removeAttribute("slot");
    } else {
      button = document.createElement("button");
      button.type = "button";
      button.append(...Array.from(source.childNodes));
      if ((button.textContent ?? "").trim() === "") {
        button.textContent = (source.textContent ?? "").trim() || `Tab ${index + 1}`;
      }
      source.remove();
    }

    button.type = "button";
    button.classList.add("tabs-tab");
    button.setAttribute("data-tw-tab", "");
    button.setAttribute("role", "tab");
    if (!button.id) button.id = `${this.#baseId}-tab-${index}`;
    return button;
  }

  #readInitialIndex(): void {
    const attr = this.getAttribute("selected-index");
    if (attr != null && attr !== "") {
      const n = Number(attr);
      if (Number.isFinite(n)) {
        this.#selected = Math.max(0, Math.trunc(n));
        return;
      }
    }

    const selectedTab = this.#tabs.findIndex(
      (tab) =>
        tab.hasAttribute("selected") ||
        tab.getAttribute("aria-selected") === "true",
    );
    if (selectedTab >= 0) this.#selected = selectedTab;
  }

  #syncSelection(): void {
    if (this.#tabs.length === 0) {
      this.#selected = 0;
      return;
    }
    if (this.#selected >= this.#tabs.length) {
      this.#selected = this.#tabs.length - 1;
    }

    for (let i = 0; i < this.#tabs.length; i++) {
      const selected = i === this.#selected;
      const tab = this.#tabs[i]!;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
      if (selected) tab.setAttribute("selected", "");
      else tab.removeAttribute("selected");
    }

    for (let i = 0; i < this.#panels.length; i++) {
      const panel = this.#panels[i]!;
      if (i === this.#selected) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    }
  }
}

defineComponent("tabs", TwTabs);
