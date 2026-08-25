import { defineComponent } from "../core/register.js";

const DEFAULT_COLLAPSED = "8rem";
const DEFAULT_EXPAND_LABEL = "もっと見る";
const DEFAULT_COLLAPSE_LABEL = "閉じる";

export class TwExpandable extends HTMLElement {
  static observedAttributes = [
    "collapsed-height",
    "expanded-height",
    "expand-label",
    "collapse-label",
    "open",
  ];

  #body: HTMLElement | null = null;
  #button: HTMLButtonElement | null = null;
  #initialized = false;

  #onToggle = (): void => {
    this.open = !this.open;
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "expandable");
    const prior = Array.from(this.childNodes);
    this.#ensureStructure();
    if (this.#body) {
      for (const node of prior) {
        if (node === this.#body || node === this.#button) continue;
        this.#body.append(node);
      }
    }
    this.#sync();
    this.#button?.addEventListener("click", this.#onToggle);
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.#button?.removeEventListener("click", this.#onToggle);
  }

  attributeChangedCallback(): void {
    if (!this.#initialized && !this.isConnected) return;
    this.#sync();
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean) {
    if (value) this.setAttribute("open", "");
    else this.removeAttribute("open");
  }

  #ensureStructure(): void {
    if (this.#body && this.#button) return;

    const body = document.createElement("div");
    body.className = "expandable-body";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "expandable-toggle";

    this.append(body, button);
    this.#body = body;
    this.#button = button;
  }

  #sync(): void {
    if (!this.#body || !this.#button) return;

    const collapsed =
      this.getAttribute("collapsed-height")?.trim() || DEFAULT_COLLAPSED;
    const expandedAttr = this.getAttribute("expanded-height")?.trim() ?? "";
    const expandLabel =
      this.getAttribute("expand-label")?.trim() || DEFAULT_EXPAND_LABEL;
    const collapseLabel =
      this.getAttribute("collapse-label")?.trim() || DEFAULT_COLLAPSE_LABEL;

    if (this.open) {
      this.#body.style.maxHeight =
        expandedAttr !== "" ? expandedAttr : `${this.#body.scrollHeight || 0}px`;
      this.#body.style.overflow = expandedAttr !== "" ? "auto" : "visible";
      this.#button.textContent = collapseLabel;
      this.#button.setAttribute("aria-expanded", "true");
    } else {
      this.#body.style.maxHeight = collapsed;
      this.#body.style.overflow = "auto";
      this.#button.textContent = expandLabel;
      this.#button.setAttribute("aria-expanded", "false");
    }
  }
}

defineComponent("expandable", TwExpandable);
