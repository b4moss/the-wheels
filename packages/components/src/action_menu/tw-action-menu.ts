import { getPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { TwDropdown } from "../dropdown/tw-dropdown.js";
import "../svg_loader/tw-svg-loader.js";

export const MORE_VERTICAL_SRC = new URL(
  "../../assets/more-vertical.svg",
  import.meta.url,
).href;

export class TwActionMenu extends HTMLElement {
  static observedAttributes = ["open", "placement", "src"];

  #dropdown: TwDropdown | null = null;
  #panelSlot: HTMLElement | null = null;
  #defaultTrigger: HTMLButtonElement | null = null;
  #icon: HTMLElement | null = null;
  #projecting = false;
  #syncingOpen = false;
  #initialized = false;
  #observer: MutationObserver | null = null;
  #openObserver: MutationObserver | null = null;
  #usingCustomTrigger = false;

  #onPanelClick = (): void => {
    this.close();
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "action-menu");
    this.#ensureStructure();
    this.#syncPlacement();
    this.#syncSrc();
    this.#syncOpenFromHost();
    this.#bindPanelClose();
    this.#observeSlots();
    this.#observeDropdownOpen();
    // Catch children that arrive in the same parse/upgrade tick after connect.
    queueMicrotask(() => {
      if (!this.isConnected) return;
      this.#projectSlots();
      this.#dropdown?.refreshSlots();
      this.#syncSrc();
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
    if (name === "src") this.#syncSrc();
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

  #ensureStructure(): void {
    if (this.#dropdown) return;

    const tag = `${getPrefix()}dropdown`;
    const dropdown = document.createElement(tag) as TwDropdown;

    const panelSlot = document.createElement("div");
    panelSlot.setAttribute("slot", "panel");
    panelSlot.className = "action-menu-panel";

    this.#dropdown = dropdown;
    this.#panelSlot = panelSlot;

    // Move user content onto the disconnected dropdown so the first
    // connectedCallback projection sees the final slotted tree.
    this.#projectSlots();
    dropdown.append(panelSlot);
    this.append(dropdown);
  }

  #createDefaultTrigger(): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "action-menu-trigger";
    button.setAttribute("slot", "trigger");

    const iconTag = `${getPrefix()}svg-loader`;
    const icon = document.createElement(iconTag);
    icon.setAttribute("src", MORE_VERTICAL_SRC);
    icon.setAttribute("width", "20");
    icon.setAttribute("height", "20");
    icon.setAttribute("stroke-color", "currentColor");
    icon.setAttribute("aria-hidden", "true");
    button.append(icon);

    this.#defaultTrigger = button;
    this.#icon = icon;
    this.#usingCustomTrigger = false;
    return button;
  }

  #observeSlots(): void {
    if (this.#observer) return;
    this.#observer = new MutationObserver(() => {
      if (this.#projecting) return;
      this.#projectSlots();
      this.#dropdown?.refreshSlots();
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

    if (triggerNodes.length) {
      this.#usingCustomTrigger = true;
      this.#defaultTrigger?.remove();
      this.#defaultTrigger = null;
      this.#icon = null;
      for (const node of triggerNodes) {
        if (node instanceof Element) node.setAttribute("slot", "trigger");
        this.#dropdown.append(node);
      }
    } else if (
      !this.#usingCustomTrigger &&
      !this.#defaultTrigger?.isConnected
    ) {
      this.#dropdown.append(this.#createDefaultTrigger());
    }

    if (panelNodes.length) {
      this.#panelSlot.append(...panelNodes);
    }

    if (this.#dropdown.isConnected) {
      this.#dropdown.refreshSlots();
    }

    this.#projecting = false;
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

  #syncSrc(): void {
    if (this.#usingCustomTrigger || !this.#icon) return;
    const src = this.getAttribute("src");
    if (src == null || src === "") {
      this.#icon.setAttribute("src", MORE_VERTICAL_SRC);
    } else {
      this.#icon.setAttribute("src", src);
    }
  }

  /** Expose for tests / debugging. */
  getDropdown(): TwDropdown | null {
    return this.#dropdown;
  }
}

defineComponent("action-menu", TwActionMenu);
