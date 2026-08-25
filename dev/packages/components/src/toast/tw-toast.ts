import {
  createSnackbarLayer,
  type SnackbarLayer,
} from "../snackbar_layer/snackbar-layer.js";
import { defineComponent } from "../core/register.js";

const VARIANTS = new Set(["info", "success", "warning", "error"]);

type ToastStack = {
  layer: SnackbarLayer;
  stack: HTMLElement;
  count: number;
};

let sharedToastStack: ToastStack | null = null;

function ensureToastStack(): ToastStack {
  if (sharedToastStack && sharedToastStack.layer.element.isConnected) {
    return sharedToastStack;
  }
  const stack = document.createElement("div");
  stack.className = "toast-stack";
  stack.setAttribute("data-tw-toast-stack", "");
  const layer = createSnackbarLayer({ content: stack });
  sharedToastStack = { layer, stack, count: 0 };
  return sharedToastStack;
}

function parseDurationMs(value: string | null): number {
  if (value == null || value.trim() === "") return 4000;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 4000;
  return Math.trunc(n);
}

export class TwToast extends HTMLElement {
  static observedAttributes = ["variant", "duration-ms"];

  #item: HTMLElement | null = null;
  #timer: ReturnType<typeof setTimeout> | null = null;
  #visible = false;

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "toast");
  }

  disconnectedCallback(): void {
    this.hide();
  }

  get variant(): string {
    const v = this.getAttribute("variant")?.trim() ?? "info";
    return VARIANTS.has(v) ? v : "info";
  }

  show(): void {
    if (this.#visible && this.#item?.isConnected) return;

    const { layer, stack } = ensureToastStack();
    const item = document.createElement("div");
    item.className = "toast-item";
    item.setAttribute("data-tw-toast-variant", this.variant);
    item.textContent = (this.textContent ?? "").trim();

    stack.append(item);
    this.#item = item;
    this.#visible = true;
    if (sharedToastStack) sharedToastStack.count += 1;
    layer.show();

    const duration = parseDurationMs(this.getAttribute("duration-ms"));
    if (duration > 0) {
      this.#clearTimer();
      this.#timer = setTimeout(() => this.hide(), duration);
    }
  }

  hide(): void {
    this.#clearTimer();
    if (this.#item) {
      this.#item.remove();
      this.#item = null;
      if (sharedToastStack) {
        sharedToastStack.count = Math.max(0, sharedToastStack.count - 1);
        if (sharedToastStack.count === 0) {
          sharedToastStack.layer.hide();
        }
      }
    }
    this.#visible = false;
  }

  /** Test helper */
  isShown(): boolean {
    return this.#visible && !!this.#item?.isConnected;
  }

  #clearTimer(): void {
    if (this.#timer != null) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }
}

defineComponent("toast", TwToast);

/** Reset shared stack (tests). */
export function resetToastStackForTests(): void {
  if (sharedToastStack) {
    sharedToastStack.layer.destroy();
    sharedToastStack = null;
  }
}
