import { defineComponent } from "../core/register.js";

const INTERACTIVE = "a, button, [href], [tabindex]";

export class TwVerticalNav extends HTMLElement {
  #observer: MutationObserver | null = null;
  #initialized = false;

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "vertical-nav");
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(() => this.#syncCurrent());
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ["aria-current"],
      childList: true,
      subtree: true,
    });
    // Children may not be ready synchronously when upgraded via innerHTML.
    this.#syncCurrent();
    queueMicrotask(() => this.#syncCurrent());
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  #interactive(): Element | null {
    return this.querySelector(INTERACTIVE);
  }

  #syncCurrent(): void {
    if (!this.isConnected && !this.#initialized) return;
    const target = this.#interactive();
    const current = target?.getAttribute("aria-current");
    if (current === "page") {
      this.setAttribute("data-tw-nav-current", "");
    } else {
      this.removeAttribute("data-tw-nav-current");
    }
  }
}

defineComponent("vertical-nav", TwVerticalNav);
