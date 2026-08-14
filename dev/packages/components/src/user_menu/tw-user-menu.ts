import { getPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwDropdown } from "../dropdown/tw-dropdown.js";

export class TwUserMenu extends HTMLElement {
  static observedAttributes = ["open", "placement"];

  #dropdown: TwDropdown | null = null;
  #panelSlot: HTMLElement | null = null;
  #projecting = false;
  #syncingOpen = false;
  #initialized = false;
  #warnedEmptyTrigger = false;
  #observer: MutationObserver | null = null;
  #openObserver: MutationObserver | null = null;

  #onPanelClick = (): void => {
    this.close();
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "user-menu");
    this.#ensureStructure();
    this.#syncPlacement();
    this.#syncOpenFromHost();
    this.#bindPanelClose();
    this.#observeSlots();
    this.#observeDropdownOpen();
    queueMicrotask(() => {
      if (!this.isConnected) return;
      this.#projectSlots();
      this.#dropdown?.refreshSlots();
      this.#warnIfEmptyTrigger();
    });
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.#panelSlot?.removeEventListener("click", this.#onPanelClick);
    this.#observer?.disconnect();
    this.#observer = null;
    this.#openObserver?.disconnect();
    this.#openObserver = null;
  }

  attributeChangedCallback(name: string): void {
    if (!this.#initialized && !this.isConnected) return;
    if (!this.#dropdown) {
      if (this.isConnected) this.#ensureStructure();
      else return;
    }

    if (name === "open") this.#syncOpenFromHost();
    if (name === "placement") this.#syncPlacement();
  }

  open(): void {
    this.#dropdown?.open();
    this.#writeOpenAttr(true);
  }

  close(): void {
    this.#dropdown?.close();
    this.#writeOpenAttr(false);
  }

  toggle(): void {
    if (this.#dropdown?.hasAttribute("open") || this.hasAttribute("open")) {
      this.close();
    } else {
      this.open();
    }
  }

  /** Expose for tests / debugging. */
  getDropdown(): TwDropdown | null {
    return this.#dropdown;
  }

  #ensureStructure(): void {
    if (this.#dropdown) return;

    const tag = `${getPrefix()}dropdown`;
    const dropdown = document.createElement(tag) as TwDropdown;

    const panelSlot = document.createElement("div");
    panelSlot.setAttribute("slot", "panel");
    panelSlot.className = "user-menu-panel";

    this.#dropdown = dropdown;
    this.#panelSlot = panelSlot;

    this.#projectSlots();
    dropdown.append(panelSlot);
    this.append(dropdown);
  }

  #observeSlots(): void {
    if (this.#observer) return;
    this.#observer = new MutationObserver(() => {
      if (this.#projecting) return;
      this.#projectSlots();
      this.#dropdown?.refreshSlots();
      this.#warnIfEmptyTrigger();
    });
    this.#observer.observe(this, { childList: true });
  }

  #projectSlots(): void {
    if (!this.#dropdown || !this.#panelSlot || this.#projecting) return;
    this.#projecting = true;

    const nodes = Array.from(this.childNodes).filter(
      (node) => node !== this.#dropdown,
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
        if (slot != null && slot !== "") {
          // Unknown named slots are ignored (not treated as trigger/items).
          continue;
        }
        panelNodes.push(node);
        continue;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        if ((node.textContent ?? "").trim() === "") continue;
        panelNodes.push(node);
      }
    }

    for (const node of triggerNodes) {
      if (node instanceof Element) node.setAttribute("slot", "trigger");
      this.#dropdown.append(node);
    }

    if (panelNodes.length) {
      this.#panelSlot.append(...panelNodes);
    }

    if (this.#dropdown.isConnected) {
      this.#dropdown.refreshSlots();
    }

    this.#projecting = false;
  }

  #warnIfEmptyTrigger(): void {
    if (this.#warnedEmptyTrigger || !this.#dropdown) return;
    const hasTrigger = this.#dropdown.querySelector('[slot="trigger"]');
    if (hasTrigger) return;
    this.#warnedEmptyTrigger = true;
    console.warn(
      "[tw-user-menu] slot=\"trigger\" is required; no default trigger is created.",
    );
  }

  #bindPanelClose(): void {
    this.#panelSlot?.addEventListener("click", this.#onPanelClick);
  }

  #observeDropdownOpen(): void {
    if (!this.#dropdown || this.#openObserver) return;
    this.#openObserver = new MutationObserver(() => {
      if (this.#syncingOpen || !this.#dropdown) return;
      this.#writeOpenAttr(this.#dropdown.hasAttribute("open"));
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
}

defineComponent("user-menu", TwUserMenu);
