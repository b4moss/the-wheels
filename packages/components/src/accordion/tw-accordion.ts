import { getPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import "../svg_loader/tw-svg-loader.js";
import { ensureAccordionGroupDelegation } from "./accordion-group.js";

export const CHEVRON_SRC = new URL(
  "../../assets/chevron.svg",
  import.meta.url,
).href;

export class TwAccordion extends HTMLElement {
  static observedAttributes = ["open"];

  #details: HTMLDetailsElement | null = null;
  #summary: HTMLElement | null = null;
  #content: HTMLElement | null = null;
  #headerSlot: HTMLElement | null = null;
  #chevron: HTMLElement | null = null;
  #projecting = false;
  #syncingOpen = false;
  #initialized = false;
  #observer: MutationObserver | null = null;

  #onToggle = (): void => {
    if (this.#syncingOpen || !this.#details) return;
    this.#writeOpenAttr(this.#details.open);
    this.#syncChevron();
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "accordion");
    this.#ensureStructure();
    this.#projectSlots();
    this.#syncOpenFromHost();
    this.#syncChevron();
    this.#bindToggle();
    this.#observeSlots();
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.#details?.removeEventListener("toggle", this.#onToggle);
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback(name: string): void {
    if (!this.#initialized && !this.isConnected) return;
    if (!this.#details) {
      if (this.isConnected) this.#ensureStructure();
      else return;
    }
    if (name === "open") {
      this.#syncOpenFromHost();
      this.#syncChevron();
    }
  }

  open(): void {
    if (!this.#details) this.#ensureStructure();
    if (!this.#details) return;
    if (this.#details.open && this.hasAttribute("open")) return;
    this.#syncingOpen = true;
    this.#details.open = true;
    this.#writeOpenAttr(true);
    this.#syncingOpen = false;
    this.#syncChevron();
  }

  close(): void {
    if (!this.#details) this.#ensureStructure();
    if (!this.#details) return;
    if (!this.#details.open && !this.hasAttribute("open")) return;
    this.#syncingOpen = true;
    this.#details.open = false;
    this.#writeOpenAttr(false);
    this.#syncingOpen = false;
    this.#syncChevron();
  }

  #ensureStructure(): void {
    if (this.#details) return;

    const details = document.createElement("details");
    details.className = "accordion";

    const summary = document.createElement("summary");
    summary.className = "accordion-summary";

    const headerSlot = document.createElement("span");
    headerSlot.className = "accordion-header";

    const chevronTag = `${getPrefix()}svg-loader`;
    const chevron = document.createElement(chevronTag);
    chevron.className = "accordion-chevron";
    chevron.setAttribute("src", CHEVRON_SRC);
    chevron.setAttribute("width", "20");
    chevron.setAttribute("height", "20");
    chevron.setAttribute("stroke-color", "currentColor");
    chevron.setAttribute("rotate", "0");
    chevron.setAttribute("aria-hidden", "true");

    summary.append(headerSlot, chevron);

    const content = document.createElement("div");
    content.className = "accordion-content";

    details.append(summary, content);
    this.append(details);

    this.#details = details;
    this.#summary = summary;
    this.#headerSlot = headerSlot;
    this.#chevron = chevron;
    this.#content = content;
  }

  #bindToggle(): void {
    this.#details?.addEventListener("toggle", this.#onToggle);
  }

  #observeSlots(): void {
    if (this.#observer) return;
    this.#observer = new MutationObserver(() => {
      if (this.#projecting) return;
      this.#projectSlots();
    });
    this.#observer.observe(this, { childList: true });
  }

  #projectSlots(): void {
    if (!this.#details || !this.#headerSlot || !this.#content || this.#projecting) {
      return;
    }
    this.#projecting = true;

    const nodes = Array.from(this.childNodes).filter(
      (node) => node !== this.#details,
    );

    const headerNodes: Node[] = [];
    const contentNodes: Node[] = [];

    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const slot = el.getAttribute("slot");
        if (slot === "header") {
          headerNodes.push(node);
          continue;
        }
        if (slot === "content") {
          contentNodes.push(node);
          continue;
        }
        // Unknown named slots and default elements are ignored.
        continue;
      }
      // Bare text is not projected into header/content.
    }

    this.#headerSlot.replaceChildren(...headerNodes);
    this.#content.replaceChildren(...contentNodes);

    for (const node of Array.from(this.childNodes)) {
      if (node === this.#details) continue;
      node.parentNode?.removeChild(node);
    }

    this.#projecting = false;
  }

  #writeOpenAttr(open: boolean): void {
    if (open) {
      if (!this.hasAttribute("open")) this.setAttribute("open", "");
    } else if (this.hasAttribute("open")) {
      this.removeAttribute("open");
    }
  }

  #syncOpenFromHost(): void {
    if (!this.#details || this.#syncingOpen) return;
    this.#syncingOpen = true;
    const shouldOpen = this.hasAttribute("open");
    if (this.#details.open !== shouldOpen) {
      this.#details.open = shouldOpen;
    }
    this.#syncingOpen = false;
  }

  #syncChevron(): void {
    if (!this.#chevron) return;
    const open = this.#details?.open || this.hasAttribute("open");
    this.#chevron.setAttribute("rotate", open ? "180" : "0");
  }
}

defineComponent("accordion", TwAccordion);
ensureAccordionGroupDelegation();
