import { defineComponent } from "../core/register.js";

export type StepStatus = "current" | "done" | "not_yet";

const STATUSES = new Set<StepStatus>(["current", "done", "not_yet"]);

function normalizeStatus(value: string | null): StepStatus | null {
  if (value == null) return null;
  return STATUSES.has(value as StepStatus) ? (value as StepStatus) : null;
}

export class TwStepNav extends HTMLElement {
  #initialized = false;
  #observer: MutationObserver | null = null;
  #rendering = false;

  #onClick = (event: Event): void => {
    // Display-only: clicks must not change status.
    event.preventDefault();
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "step-nav");
    this.addEventListener("click", this.#onClick);
    this.#render();
    this.#observe();
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.removeEventListener("click", this.#onClick);
    this.#observer?.disconnect();
    this.#observer = null;
  }

  /**
   * Sets the step at `index` to `current` only.
   * Does not rewrite other steps' status values.
   */
  setCurrent(index: number): void {
    if (!Number.isFinite(index)) return;
    const steps = this.#steps();
    const i = Math.trunc(index);
    if (i < 0 || i >= steps.length) return;
    steps[i]!.setAttribute("status", "current");
    this.#render();
  }

  #observe(): void {
    if (this.#observer) return;
    this.#observer = new MutationObserver(() => {
      if (!this.#initialized || this.#rendering) return;
      this.#render();
    });
    this.#observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["status"],
    });
  }

  #steps(): HTMLElement[] {
    return Array.from(this.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
  }

  #render(): void {
    this.#rendering = true;
    const steps = this.#steps();
    steps.forEach((step, index) => {
      step.setAttribute("data-tw-step", "");
      step.classList.add("step-nav-item");
      step.setAttribute("data-tw-step-index", String(index));

      const raw = step.getAttribute("status");
      const status = normalizeStatus(raw);
      // Unknown status: leave attribute as-is; chrome uses data attribute fallback
      step.setAttribute(
        "data-tw-step-status",
        status ?? (raw && raw !== "" ? raw : "not_yet"),
      );

      let marker = step.querySelector(":scope > .step-nav-marker");
      if (!marker) {
        marker = document.createElement("span");
        marker.className = "step-nav-marker";
        step.prepend(marker);
      }
      marker.textContent = String(index + 1);
    });
    this.#rendering = false;
  }
}

defineComponent("step-nav", TwStepNav);
