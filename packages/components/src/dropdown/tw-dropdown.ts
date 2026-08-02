import {
  autoUpdate,
  computePosition,
} from "@floating-ui/dom";
import { defineComponent } from "../core/register.js";
import {
  createDropdownMiddleware,
  normalizePlacement,
} from "./floating.js";

export class TwDropdown extends HTMLElement {
  static observedAttributes = ["open", "placement"];

  #trigger: HTMLElement | null = null;
  #panel: HTMLElement | null = null;
  #projecting = false;
  #initialized = false;
  #positionCleanup: (() => void) | null = null;
  #outsideBound = false;
  #escapeBound = false;
  #observer: MutationObserver | null = null;

  #onTriggerClick = (event: Event): void => {
    event.stopPropagation();
    this.toggle();
  };

  #onDocumentPointerDown = (event: Event): void => {
    if (!this.hasAttribute("open")) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (this.contains(target)) return;
    this.close();
  };

  #onDocumentKeydown = (event: KeyboardEvent): void => {
    if (!this.hasAttribute("open")) return;
    if (event.key !== "Escape") return;
    this.close();
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "dropdown");
    this.#ensureStructure();
    this.#projectSlots();
    this.#syncOpenUi();
    this.#bindTrigger();
    this.#observeSlots();
    this.#initialized = true;
    if (this.hasAttribute("open")) {
      this.#startPositioning();
      this.#bindOutside();
      this.#bindEscape();
    }
  }

  disconnectedCallback(): void {
    this.#unbindTrigger();
    this.#unbindOutside();
    this.#unbindEscape();
    this.#stopPositioning();
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback(name: string): void {
    if (!this.#initialized && !this.isConnected) return;
    if (!this.#trigger || !this.#panel) {
      if (this.isConnected) this.#ensureStructure();
      else return;
    }

    if (name === "open") {
      this.#syncOpenUi();
      if (this.hasAttribute("open")) {
        this.#startPositioning();
        this.#bindOutside();
        this.#bindEscape();
      } else {
        this.#stopPositioning();
        this.#unbindOutside();
        this.#unbindEscape();
      }
      return;
    }

    if (name === "placement" && this.hasAttribute("open")) {
      this.#startPositioning();
    }
  }

  open(): void {
    if (this.hasAttribute("open")) return;
    this.setAttribute("open", "");
  }

  close(): void {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
  }

  toggle(): void {
    if (this.hasAttribute("open")) this.close();
    else this.open();
  }

  getPlacement(): string {
    return normalizePlacement(this.getAttribute("placement"));
  }

  /** Re-run light-DOM slot projection (e.g. after composition parents append slots). */
  refreshSlots(): void {
    this.#ensureStructure();
    this.#projectSlots();
  }

  #ensureStructure(): void {
    if (this.#trigger && this.#panel) return;

    let trigger = this.querySelector(":scope > .trigger") as HTMLElement | null;
    let panel = this.querySelector(":scope > .panel") as HTMLElement | null;

    if (!trigger) {
      trigger = document.createElement("div");
      trigger.className = "trigger";
      this.append(trigger);
    }
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "panel";
      this.append(panel);
    }

    this.#trigger = trigger;
    this.#panel = panel;
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
    if (!this.#trigger || !this.#panel || this.#projecting) return;
    this.#projecting = true;

    const nodes = Array.from(this.childNodes).filter(
      (node) => node !== this.#trigger && node !== this.#panel,
    );

    const triggerNodes: Node[] = [];
    const panelNodes: Node[] = [];

    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const slot = el.getAttribute("slot");
        if (slot === "trigger") {
          triggerNodes.push(node);
          continue;
        }
        if (slot === "panel") {
          panelNodes.push(node);
          continue;
        }
        // Unknown named slots stay on the host; default/text ignored for dropdown.
        continue;
      }
    }

    if (triggerNodes.length) {
      this.#trigger.replaceChildren(...triggerNodes);
    }
    if (panelNodes.length) {
      this.#panel.replaceChildren(...panelNodes);
    }

    this.#projecting = false;
  }

  #bindTrigger(): void {
    this.#trigger?.addEventListener("click", this.#onTriggerClick);
  }

  #unbindTrigger(): void {
    this.#trigger?.removeEventListener("click", this.#onTriggerClick);
  }

  #bindOutside(): void {
    if (this.#outsideBound) return;
    document.addEventListener("pointerdown", this.#onDocumentPointerDown, true);
    this.#outsideBound = true;
  }

  #unbindOutside(): void {
    if (!this.#outsideBound) return;
    document.removeEventListener(
      "pointerdown",
      this.#onDocumentPointerDown,
      true,
    );
    this.#outsideBound = false;
  }

  #bindEscape(): void {
    if (this.#escapeBound) return;
    document.addEventListener("keydown", this.#onDocumentKeydown, true);
    this.#escapeBound = true;
  }

  #unbindEscape(): void {
    if (!this.#escapeBound) return;
    document.removeEventListener("keydown", this.#onDocumentKeydown, true);
    this.#escapeBound = false;
  }

  #syncOpenUi(): void {
    if (!this.#panel) return;
    if (this.hasAttribute("open")) {
      this.#panel.removeAttribute("hidden");
    } else {
      this.#panel.setAttribute("hidden", "");
    }
  }

  #startPositioning(): void {
    this.#stopPositioning();
    const reference = this.#trigger;
    const floating = this.#panel;
    if (!reference || !floating) return;

    // Skip when both regions are empty (no content to place against).
    if (
      reference.childNodes.length === 0 ||
      floating.childNodes.length === 0
    ) {
      return;
    }

    const update = (): void => {
      void computePosition(reference, floating, {
        placement: normalizePlacement(this.getAttribute("placement")),
        middleware: createDropdownMiddleware(),
      }).then(({ x, y, strategy }) => {
        if (!this.hasAttribute("open")) return;
        Object.assign(floating.style, {
          position: strategy,
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    };

    this.#positionCleanup = autoUpdate(reference, floating, update);
  }

  #stopPositioning(): void {
    this.#positionCleanup?.();
    this.#positionCleanup = null;
  }
}

defineComponent("dropdown", TwDropdown);
