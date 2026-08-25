import { getPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import spinnerUrl from "../../assets/spinner.svg?url";

const APPEARANCE_ATTRS = [
  "width",
  "height",
  "padding",
  "stroke-width",
  "fill-color",
  "stroke-color",
  "flip",
  "rotate",
] as const;

const DEFAULT_SPINNER_SRC = spinnerUrl;

export class TwSpinner extends HTMLElement {
  static observedAttributes = ["src", ...APPEARANCE_ATTRS];

  #loader: HTMLElement | null = null;

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "spinner");
    try {
      this.#ensureLoader();
      this.#syncToLoader();
    } catch {
      // Asset URL resolution or child creation must not throw from connect.
    }
  }

  attributeChangedCallback(): void {
    if (!this.isConnected) return;
    try {
      this.#ensureLoader();
      this.#syncToLoader();
    } catch {
      // ignore
    }
  }

  #ensureLoader(): void {
    if (this.#loader?.isConnected) return;
    const tag = `${getPrefix()}svg-loader`;
    this.#loader = document.createElement(tag);
    this.#loader.className = "spinner-loader";
    this.replaceChildren(this.#loader);
  }

  #syncToLoader(): void {
    if (!this.#loader) return;

    const src = this.getAttribute("src");
    this.#loader.setAttribute("src", src && src !== "" ? src : DEFAULT_SPINNER_SRC);

    const width = this.getAttribute("width");
    const height = this.getAttribute("height");
    if (width) this.#loader.setAttribute("width", width);
    else this.#loader.removeAttribute("width");
    if (height) this.#loader.setAttribute("height", height);
    else this.#loader.removeAttribute("height");

    if (!width && !height) {
      this.#loader.style.width = "1em";
      this.#loader.style.height = "1em";
    } else {
      this.#loader.style.width = "";
      this.#loader.style.height = "";
    }

    for (const attr of APPEARANCE_ATTRS) {
      if (attr === "width" || attr === "height") continue;
      const value = this.getAttribute(attr);
      if (value != null) this.#loader.setAttribute(attr, value);
      else this.#loader.removeAttribute(attr);
    }
  }
}

defineComponent("spinner", TwSpinner);

export { DEFAULT_SPINNER_SRC };
