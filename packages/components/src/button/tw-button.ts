import { getPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";

const VARIANTS = new Set(["default", "stroke", "ghost"]);
export const LOCK_SRC = new URL("../../assets/lock.svg", import.meta.url).href;

type SlotName = "icon-left" | "default" | "icon-right";

export class TwButton extends HTMLElement {
  static observedAttributes = [
    "type",
    "variant",
    "disabled",
    "disable-on-click",
  ];

  #button: HTMLButtonElement | null = null;
  #label: HTMLSpanElement | null = null;
  #iconLeft: HTMLSpanElement | null = null;
  #iconRight: HTMLSpanElement | null = null;
  #spinner: HTMLElement | null = null;
  #lock: HTMLElement | null = null;
  #clickDisabled = false;
  #projecting = false;
  #initialized = false;
  #onClick = (): void => {
    if (!this.hasAttribute("disable-on-click")) return;
    if (this.#isDisabled()) return;
    this.#clickDisabled = true;
    this.#syncDisabledUi();
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "button");
    this.#ensureStructure();
    this.#projectSlots();
    this.#syncVariant();
    this.#syncType();
    this.#syncDisabledUi();
    this.#button?.addEventListener("click", this.#onClick);
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.#button?.removeEventListener("click", this.#onClick);
  }

  attributeChangedCallback(name: string): void {
    if (!this.#initialized && !this.isConnected) return;
    if (!this.#button) {
      if (this.isConnected) this.#ensureStructure();
      else return;
    }

    if (name === "type") this.#syncType();
    if (name === "variant") this.#syncVariant();
    if (name === "disabled" || name === "disable-on-click") {
      this.#syncDisabledUi();
    }
  }

  reset(): void {
    this.#clickDisabled = false;
    this.#syncDisabledUi();
  }

  #ensureStructure(): void {
    if (this.#button) return;

    const button = document.createElement("button");
    button.className = "button";
    button.type = "button";

    const label = document.createElement("span");
    label.className = "button-label";

    button.append(label);
    this.append(button);

    this.#button = button;
    this.#label = label;
  }

  #projectSlots(): void {
    if (!this.#button || !this.#label || this.#projecting) return;
    this.#projecting = true;

    const nodes = Array.from(this.childNodes).filter(
      (node) => node !== this.#button && node !== this.#lock,
    );

    const buckets: Record<SlotName, Node[]> = {
      "icon-left": [],
      default: [],
      "icon-right": [],
    };

    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const slot = el.getAttribute("slot");
        if (slot === "icon-left") {
          buckets["icon-left"].push(node);
          continue;
        }
        if (slot === "icon-right") {
          buckets["icon-right"].push(node);
          continue;
        }
        if (slot != null && slot !== "") {
          // Unknown named slots are ignored.
          continue;
        }
        buckets.default.push(node);
        continue;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        if ((node.textContent ?? "").trim() === "") continue;
        buckets.default.push(node);
      }
    }

    this.#iconLeft?.remove();
    this.#iconRight?.remove();
    this.#iconLeft = null;
    this.#iconRight = null;

    this.#label.replaceChildren();

    if (this.#hasContent(buckets["icon-left"])) {
      const wrap = document.createElement("span");
      wrap.className = "button-icon-left";
      wrap.append(...buckets["icon-left"]);
      this.#button.insertBefore(wrap, this.#label);
      this.#iconLeft = wrap;
    } else {
      for (const node of buckets["icon-left"]) node.parentNode?.removeChild(node);
    }

    if (this.#hasContent(buckets.default)) {
      this.#label.append(...buckets.default);
    }

    if (this.#hasContent(buckets["icon-right"])) {
      const wrap = document.createElement("span");
      wrap.className = "button-icon-right";
      wrap.append(...buckets["icon-right"]);
      this.#button.append(wrap);
      this.#iconRight = wrap;
    } else {
      for (const node of buckets["icon-right"]) node.parentNode?.removeChild(node);
    }

    // Drop leftover ignored slot nodes from the host.
    for (const node of Array.from(this.childNodes)) {
      if (node === this.#button || node === this.#lock) continue;
      node.parentNode?.removeChild(node);
    }

    this.#projecting = false;
  }

  #hasContent(nodes: Node[]): boolean {
    return nodes.some((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent ?? "").trim() !== "";
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        return this.#isMeaningfulElement(node as Element);
      }
      return false;
    });
  }

  #isMeaningfulElement(el: Element): boolean {
    if (el.localName.includes("-")) return true;
    if (el.children.length > 0) return true;
    if ((el.textContent ?? "").trim() !== "") return true;
    for (const attr of Array.from(el.attributes)) {
      if (attr.name !== "slot") return true;
    }
    return false;
  }

  #syncType(): void {
    if (!this.#button) return;
    const type = this.getAttribute("type");
    this.#button.type =
      type === "submit" || type === "reset" || type === "button"
        ? type
        : "button";
  }

  #syncVariant(): void {
    const raw = this.getAttribute("variant");
    const variant = raw && VARIANTS.has(raw) ? raw : "default";
    if (raw !== variant) {
      this.setAttribute("variant", variant);
    }
    if (!this.#button) return;
    this.#button.classList.remove(
      "button--default",
      "button--stroke",
      "button--ghost",
    );
    this.#button.classList.add(`button--${variant}`);
  }

  #isDisabled(): boolean {
    return this.hasAttribute("disabled") || this.#clickDisabled;
  }

  #syncDisabledUi(): void {
    if (!this.#button) return;

    const disabled = this.#isDisabled();
    this.#button.disabled = disabled;

    if (this.#clickDisabled) {
      this.#ensureSpinner();
      this.#iconLeft?.setAttribute("hidden", "");
      this.#label?.setAttribute("hidden", "");
      this.#iconRight?.setAttribute("hidden", "");
      this.#spinner?.removeAttribute("hidden");
    } else {
      this.#spinner?.remove();
      this.#spinner = null;
      this.#iconLeft?.removeAttribute("hidden");
      this.#label?.removeAttribute("hidden");
      this.#iconRight?.removeAttribute("hidden");
    }

    if (disabled) {
      this.#ensureLock();
    } else {
      this.#lock?.remove();
      this.#lock = null;
    }
  }

  #ensureSpinner(): void {
    if (this.#spinner?.isConnected) return;
    const tag = `${getPrefix()}spinner`;
    const spinner = document.createElement(tag);
    spinner.className = "button-spinner";
    this.#button?.append(spinner);
    this.#spinner = spinner;
  }

  #ensureLock(): void {
    if (this.#lock?.isConnected) return;
    const tag = `${getPrefix()}svg-loader`;
    const lock = document.createElement(tag);
    lock.className = "button-lock";
    lock.setAttribute("src", LOCK_SRC);
    lock.setAttribute("width", "16");
    lock.setAttribute("height", "16");
    lock.setAttribute("aria-hidden", "true");
    this.append(lock);
    this.#lock = lock;
  }
}

defineComponent("button", TwButton);
