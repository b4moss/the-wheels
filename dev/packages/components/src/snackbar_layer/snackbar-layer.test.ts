import { afterEach, describe, expect, it } from "vitest";
import {
  createSnackbarLayer,
  SNACKBAR_LAYER_ATTR,
} from "./snackbar-layer.js";

describe("createSnackbarLayer", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("creates a bottom-placed layer with data-tw-snackbar-layer", () => {
    const layer = createSnackbarLayer();
    expect(layer.element.getAttribute(SNACKBAR_LAYER_ATTR)).toBe("");
    expect(layer.element.classList.contains("snackbar-layer")).toBe(true);
    expect(document.body.contains(layer.element)).toBe(true);
    expect(layer.element.hidden).toBe(true);
  });

  it("show makes the layer visible", () => {
    const layer = createSnackbarLayer();
    layer.show();
    expect(layer.element.hidden).toBe(false);
    expect(layer.isVisible()).toBe(true);
  });

  it("hide hides the layer", () => {
    const layer = createSnackbarLayer();
    layer.show();
    layer.hide();
    expect(layer.element.hidden).toBe(true);
    expect(layer.isVisible()).toBe(false);
  });

  it("double show / double hide does not throw", () => {
    const layer = createSnackbarLayer();
    expect(() => {
      layer.show();
      layer.show();
      layer.hide();
      layer.hide();
    }).not.toThrow();
  });

  it("appends optional content and supports custom parent", () => {
    const parent = document.createElement("div");
    document.body.append(parent);
    const content = document.createElement("p");
    content.textContent = "hello";
    const layer = createSnackbarLayer({ parent, content });
    expect(parent.contains(layer.element)).toBe(true);
    expect(layer.element.contains(content)).toBe(true);
  });

  it("destroy removes the element and makes further show/hide no-ops", () => {
    const layer = createSnackbarLayer();
    layer.destroy();
    expect(document.body.contains(layer.element)).toBe(false);
    expect(() => {
      layer.show();
      layer.hide();
      layer.destroy();
    }).not.toThrow();
    expect(layer.isVisible()).toBe(false);
  });
});
