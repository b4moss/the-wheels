import { getPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import "../svg_loader/tw-svg-loader.js";

export const CLOSE_SRC = new URL("../../assets/close.svg", import.meta.url)
  .href;

export class TwModal extends HTMLElement {
  #dialog: HTMLDialogElement | null = null;
  #header: HTMLElement | null = null;
  #headerBody: HTMLElement | null = null;
  #content: HTMLElement | null = null;
  #footer: HTMLElement | null = null;
  #closer: HTMLButtonElement | null = null;
  #projecting = false;
  #initialized = false;
  #sizeLocked = false;
  #observer: MutationObserver | null = null;

  #onDialogClick = (event: MouseEvent): void => {
    if (!this.#dialog) return;
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest("[data-tw-modal-close]")) {
      this.close();
      return;
    }

    if (target === this.#dialog) {
      this.close();
    }
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "modal");
    this.#ensureStructure();
    this.#projectSlots();
    this.#bindDialog();
    this.#observeSlots();
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.#dialog?.removeEventListener("click", this.#onDialogClick);
    this.#observer?.disconnect();
    this.#observer = null;
  }

  showModal(): void {
    if (!this.#dialog) this.#ensureStructure();
    if (!this.#dialog) return;

    try {
      if (!this.#dialog.open) this.#dialog.showModal();
    } catch {
      // Some environments may throw if already open; ignore.
    }

    if (!this.#sizeLocked) {
      requestAnimationFrame(() => this.#lockSize());
    }
  }

  close(): void {
    if (!this.#dialog) return;
    if (!this.#dialog.open) return;
    this.#dialog.close();
  }

  #ensureStructure(): void {
    if (this.#dialog) return;

    const dialog = document.createElement("dialog");
    dialog.className = "modal";

    const header = document.createElement("header");
    header.className = "modal-header";

    const headerBody = document.createElement("div");
    headerBody.className = "modal-header-body";

    const closer = document.createElement("button");
    closer.type = "button";
    closer.className = "modal-close";
    closer.setAttribute("data-tw-modal-close", "");
    closer.setAttribute("aria-label", "Close");

    const iconTag = `${getPrefix()}svg-loader`;
    const icon = document.createElement(iconTag);
    icon.setAttribute("src", CLOSE_SRC);
    icon.setAttribute("width", "20");
    icon.setAttribute("height", "20");
    icon.setAttribute("stroke-color", "currentColor");
    icon.setAttribute("aria-hidden", "true");
    closer.append(icon);

    header.append(headerBody, closer);
    dialog.append(header);

    this.append(dialog);

    this.#dialog = dialog;
    this.#header = header;
    this.#headerBody = headerBody;
    this.#closer = closer;
  }

  #bindDialog(): void {
    this.#dialog?.addEventListener("click", this.#onDialogClick);
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
    if (!this.#dialog || !this.#header || !this.#headerBody || this.#projecting) {
      return;
    }
    this.#projecting = true;

    const nodes = Array.from(this.childNodes).filter(
      (node) => node !== this.#dialog,
    );

    const headerNodes: Node[] = [];
    const contentNodes: Node[] = [];
    const footerNodes: Node[] = [];

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
        if (slot === "footer") {
          footerNodes.push(node);
          continue;
        }
        continue;
      }
    }

    this.#headerBody.replaceChildren(...headerNodes);

    if (this.#hasContent(contentNodes)) {
      if (!this.#content) {
        const content = document.createElement("div");
        content.className = "modal-content";
        this.#dialog.insertBefore(content, this.#footer);
        this.#content = content;
      }
      this.#content.replaceChildren(...contentNodes);
    } else if (this.#content) {
      this.#content.remove();
      this.#content = null;
      for (const node of contentNodes) node.parentNode?.removeChild(node);
    }

    if (this.#hasContent(footerNodes)) {
      if (!this.#footer) {
        const footer = document.createElement("footer");
        footer.className = "modal-footer";
        this.#dialog.append(footer);
        this.#footer = footer;
      }
      this.#footer.replaceChildren(...footerNodes);
    } else if (this.#footer) {
      this.#footer.remove();
      this.#footer = null;
      for (const node of footerNodes) node.parentNode?.removeChild(node);
    }

    for (const node of Array.from(this.childNodes)) {
      if (node === this.#dialog) continue;
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
        const el = node as Element;
        if (el.localName.includes("-")) return true;
        if (el.children.length > 0) return true;
        if ((el.textContent ?? "").trim() !== "") return true;
        for (const attr of Array.from(el.attributes)) {
          if (attr.name !== "slot") return true;
        }
        return false;
      }
      return false;
    });
  }

  #lockSize(): void {
    if (!this.#dialog || this.#sizeLocked || !this.#dialog.open) return;
    const width = this.#dialog.offsetWidth;
    const height = this.#dialog.offsetHeight;
    this.#dialog.style.width = `${width}px`;
    this.#dialog.style.height = `${height}px`;
    this.#sizeLocked = true;
  }
}

defineComponent("modal", TwModal);
