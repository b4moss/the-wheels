export const SNACKBAR_LAYER_ATTR = "data-tw-snackbar-layer";

export type SnackbarLayer = {
  readonly element: HTMLElement;
  show(): void;
  hide(): void;
  isVisible(): boolean;
  destroy(): void;
};

export type CreateSnackbarLayerOptions = {
  /** Parent to append the layer into. Defaults to `document.body`. */
  parent?: ParentNode | null;
  /** Initial content nodes (optional). */
  content?: Node | Node[] | null;
};

/**
 * Shared bottom-fixed snackbar layer (module, not a WC).
 * CookieConsent (and future Toast) reuse this for show/hide placement.
 */
export function createSnackbarLayer(
  options: CreateSnackbarLayerOptions = {},
): SnackbarLayer {
  const el = document.createElement("div");
  el.setAttribute(SNACKBAR_LAYER_ATTR, "");
  el.className = "snackbar-layer";
  el.hidden = true;

  if (options.content) {
    const nodes = Array.isArray(options.content)
      ? options.content
      : [options.content];
    el.append(...nodes);
  }

  const parent = options.parent ?? document.body;
  parent.append(el);

  let destroyed = false;

  return {
    get element() {
      return el;
    },
    show() {
      if (destroyed) return;
      el.hidden = false;
    },
    hide() {
      if (destroyed) return;
      el.hidden = true;
    },
    isVisible() {
      return !destroyed && !el.hidden;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      el.remove();
    },
  };
}
