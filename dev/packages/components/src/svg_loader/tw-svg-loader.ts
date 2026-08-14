import { defineComponent } from "../core/register.js";

const POSITIVE_NUMBER = /^\d+(\.\d+)?$/;
const FLIP_VALUES = new Set(["horizontal", "vertical", "both"]);

function parsePositiveNumber(value: string | null): number | null {
  if (value == null || value === "") return null;
  if (!POSITIVE_NUMBER.test(value)) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseRotate(value: string | null): number | null {
  if (value == null || value === "") return null;
  if (!/^-?\d+(\.\d+)?$/.test(value)) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export class TwSvgLoader extends HTMLElement {
  static observedAttributes = [
    "src",
    "width",
    "height",
    "padding",
    "stroke-width",
    "fill-color",
    "stroke-color",
    "flip",
    "rotate",
  ];

  #requestId = 0;

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "svg-loader");
    void this.#load();
  }

  attributeChangedCallback(name: string): void {
    if (!this.isConnected) return;
    if (name === "src") {
      void this.#load();
      return;
    }
    this.#applyAppearance();
  }

  async #load(): Promise<void> {
    const src = this.getAttribute("src");
    if (src == null || src === "") {
      this.replaceChildren();
      this.#applyAppearance();
      return;
    }

    const requestId = ++this.#requestId;
    try {
      const response = await fetch(src);
      if (requestId !== this.#requestId) return;
      if (!response.ok) {
        this.#showPlaceholder();
        return;
      }

      const text = await response.text();
      if (requestId !== this.#requestId) return;

      const doc = new DOMParser().parseFromString(text, "image/svg+xml");
      const svg = doc.querySelector("svg");
      const hasParserError =
        doc.querySelector("parsererror") != null ||
        (doc.documentElement?.nodeName.toLowerCase() === "parsererror");

      if (!svg || hasParserError) {
        this.#showPlaceholder();
        return;
      }

      const imported = document.importNode(svg, true);
      this.replaceChildren(imported);
      this.#applyAppearance();
    } catch {
      if (requestId !== this.#requestId) return;
      this.#showPlaceholder();
    }
  }

  #showPlaceholder(): void {
    const placeholder = document.createElement("span");
    placeholder.className = "svg-loader-placeholder";
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.textContent = "?";
    placeholder.style.display = "inline-flex";
    placeholder.style.alignItems = "center";
    placeholder.style.justifyContent = "center";
    placeholder.style.boxSizing = "border-box";
    placeholder.style.border = "1px dashed currentColor";
    placeholder.style.minWidth = "1em";
    placeholder.style.minHeight = "1em";
    placeholder.style.padding = "0.125em";
    placeholder.style.lineHeight = "1";
    this.replaceChildren(placeholder);
    this.#applyAppearance();
  }

  #applyAppearance(): void {
    const width = parsePositiveNumber(this.getAttribute("width"));
    const height = parsePositiveNumber(this.getAttribute("height"));
    const padding = parsePositiveNumber(this.getAttribute("padding"));
    const strokeWidth = parsePositiveNumber(this.getAttribute("stroke-width"));
    const fillColor = this.getAttribute("fill-color");
    const strokeColor = this.getAttribute("stroke-color");
    const flip = this.getAttribute("flip");
    const rotate = parseRotate(this.getAttribute("rotate"));

    this.style.display = "inline-flex";
    this.style.boxSizing = "border-box";
    if (this.hasAttribute("width")) {
      this.style.width = width != null ? `${width}px` : "";
    }
    if (this.hasAttribute("height")) {
      this.style.height = height != null ? `${height}px` : "";
    }
    if (this.hasAttribute("padding")) {
      this.style.padding = padding != null ? `${padding}px` : "";
    } else {
      this.style.padding = "";
    }

    const transforms: string[] = [];
    if (flip && FLIP_VALUES.has(flip)) {
      if (flip === "horizontal") transforms.push("scaleX(-1)");
      else if (flip === "vertical") transforms.push("scaleY(-1)");
      else transforms.push("scale(-1)");
    }
    if (rotate != null) {
      transforms.push(`rotate(${rotate}deg)`);
    }
    this.style.transform = transforms.length ? transforms.join(" ") : "";

    const svg = this.querySelector("svg");
    const target = svg ?? this.querySelector(".svg-loader-placeholder");
    if (!target) return;

    if (target instanceof SVGElement) {
      target.style.width = width != null ? "100%" : "";
      target.style.height = height != null ? "100%" : "";
      target.style.display = "block";
      if (strokeWidth != null) {
        target.setAttribute("stroke-width", String(strokeWidth));
        target.style.strokeWidth = String(strokeWidth);
      } else {
        target.style.strokeWidth = "";
      }
      if (fillColor) {
        target.style.fill = fillColor;
      } else {
        target.style.fill = "";
      }
      if (strokeColor) {
        target.style.stroke = strokeColor;
        target.style.color = strokeColor;
      } else {
        target.style.stroke = "";
        target.style.color = "";
      }
    } else {
      const el = target as HTMLElement;
      if (width != null) el.style.width = "100%";
      if (height != null) el.style.height = "100%";
    }
  }
}

defineComponent("svg-loader", TwSvgLoader);
