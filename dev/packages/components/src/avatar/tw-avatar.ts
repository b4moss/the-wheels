import { defineComponent } from "../core/register.js";
import {
  DEFAULT_AVATAR_BG,
  parseColor,
  pickContrastingTextColor,
} from "./contrast.js";
import { getFirstGrapheme } from "./grapheme.js";

const DEFAULT_SIZE = 40;

function parseSize(value: string | null): number {
  if (value == null || value === "") return DEFAULT_SIZE;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_SIZE;
  return n;
}

export class TwAvatar extends HTMLElement {
  static observedAttributes = [
    "image-path",
    "alt",
    "name",
    "color",
    "width",
    "height",
  ];

  #root: HTMLSpanElement | null = null;
  #initial: HTMLSpanElement | null = null;
  #img: HTMLImageElement | null = null;
  #initialized = false;

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "avatar");
    this.#ensureStructure();
    this.#render();
    this.#initialized = true;
  }

  attributeChangedCallback(): void {
    if (!this.#initialized && !this.isConnected) return;
    if (!this.#root) {
      if (this.isConnected) this.#ensureStructure();
      else return;
    }
    this.#render();
  }

  #ensureStructure(): void {
    if (this.#root) return;
    const root = document.createElement("span");
    root.className = "avatar";
    const initial = document.createElement("span");
    initial.className = "avatar-initial";
    root.append(initial);
    this.append(root);
    this.#root = root;
    this.#initial = initial;
  }

  #resolveCssVar = (value: string): string | null => {
    const probe = document.createElement("span");
    probe.style.color = value;
    this.append(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    if (!resolved || resolved === "rgba(0, 0, 0, 0)") return null;
    const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(resolved);
    if (!match) return null;
    const hex = [match[1], match[2], match[3]]
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("");
    return `#${hex}`;
  };

  #backgroundColor(): string {
    const color = this.getAttribute("color");
    if (!color) return DEFAULT_AVATAR_BG;
    if (parseColor(color, this.#resolveCssVar)) return color.trim();
    if (/^var\(/i.test(color.trim())) {
      const resolved = this.#resolveCssVar(color.trim());
      if (resolved) return resolved;
    }
    return DEFAULT_AVATAR_BG;
  }

  #showInitial(): void {
    if (!this.#root || !this.#initial) return;
    this.#img?.remove();
    this.#img = null;
    const bg = this.#backgroundColor();
    const text = pickContrastingTextColor(bg, this.#resolveCssVar);
    this.#initial.hidden = false;
    this.#initial.textContent = getFirstGrapheme(this.getAttribute("name") ?? "");
    this.#root.style.backgroundColor = bg;
    this.#root.style.color = text;
    this.#root.classList.remove("avatar--image");
  }

  #showImage(src: string): void {
    if (!this.#root || !this.#initial) return;
    this.#initial.hidden = true;
    this.#initial.textContent = "";
    this.#root.style.backgroundColor = this.#backgroundColor();
    this.#root.classList.add("avatar--image");

    if (!this.#img) {
      const img = document.createElement("img");
      img.className = "avatar-image";
      img.addEventListener("error", () => {
        this.#showInitial();
      });
      this.#root.append(img);
      this.#img = img;
    }
    this.#img.alt = this.getAttribute("alt") ?? "";
    this.#img.src = src;
  }

  #render(): void {
    if (!this.#root) return;
    const width = parseSize(this.getAttribute("width"));
    const height = parseSize(this.getAttribute("height"));
    this.#root.style.width = `${width}px`;
    this.#root.style.height = `${height}px`;

    const imagePath = this.getAttribute("image-path");
    if (imagePath) {
      this.#showImage(imagePath);
      return;
    }
    this.#showInitial();
  }
}

defineComponent("avatar", TwAvatar);
