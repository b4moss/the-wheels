import { getEventName } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";

function parsePositiveInt(value: string | null, fallback: number): number {
  if (value == null || value.trim() === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.trunc(n);
}

export class TwPagination extends HTMLElement {
  static observedAttributes = ["page", "total-pages"];

  #root: HTMLElement | null = null;
  #initialized = false;

  #onClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const btn = target.closest("[data-tw-page]");
    if (!(btn instanceof HTMLButtonElement) || btn.disabled) return;
    if (!this.#root?.contains(btn)) return;
    const raw = btn.getAttribute("data-tw-page");
    if (raw == null) return;
    const next = Number(raw);
    if (!Number.isFinite(next)) return;
    this.#goTo(Math.trunc(next));
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "pagination");
    this.#ensureStructure();
    this.#render();
    this.#root?.addEventListener("click", this.#onClick);
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.#root?.removeEventListener("click", this.#onClick);
  }

  attributeChangedCallback(): void {
    if (!this.#initialized && !this.isConnected) return;
    this.#render();
  }

  get page(): number {
    return parsePositiveInt(this.getAttribute("page"), 1);
  }

  get totalPages(): number {
    return parsePositiveInt(this.getAttribute("total-pages"), 1);
  }

  #ensureStructure(): void {
    if (this.#root) return;
    const root = document.createElement("div");
    root.className = "pagination-root";
    this.append(root);
    this.#root = root;
  }

  #goTo(page: number): void {
    const total = this.totalPages;
    const next = Math.max(1, Math.min(page, total));
    const prev = this.page;
    if (next === prev) return;
    this.setAttribute("page", String(next));
    this.dispatchEvent(
      new CustomEvent(getEventName("change"), {
        bubbles: true,
        detail: { page: next },
      }),
    );
  }

  #render(): void {
    if (!this.#root) return;
    let page = this.page;
    const total = this.totalPages;
    if (page > total) {
      page = total;
      if (this.getAttribute("page") !== String(page)) {
        this.setAttribute("page", String(page));
      }
    }

    const frag = document.createDocumentFragment();

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "pagination-prev";
    prev.textContent = "前へ";
    prev.disabled = page <= 1;
    prev.setAttribute("data-tw-page", String(page - 1));
    frag.append(prev);

    for (let i = 1; i <= total; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pagination-page";
      btn.textContent = String(i);
      btn.setAttribute("data-tw-page", String(i));
      if (i === page) {
        btn.setAttribute("aria-current", "page");
        btn.disabled = true;
      }
      frag.append(btn);
    }

    const next = document.createElement("button");
    next.type = "button";
    next.className = "pagination-next";
    next.textContent = "次へ";
    next.disabled = page >= total;
    next.setAttribute("data-tw-page", String(page + 1));
    frag.append(next);

    this.#root.replaceChildren(frag);
  }
}

defineComponent("pagination", TwPagination);
