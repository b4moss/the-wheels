import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  parseColor,
  pickContrastingTextColor,
  relativeLuminance,
} from "./contrast.js";

describe("parseColor", () => {
  it("parses short and long hex", () => {
    expect(parseColor("#000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseColor("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseColor("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor("#e1e1e1")).toEqual({ r: 225, g: 225, b: 225 });
  });

  it("resolves CSS variables via resolveVar", () => {
    expect(
      parseColor("var(--tw-bg-button-optional)", () => "#e1e1e1"),
    ).toEqual({ r: 225, g: 225, b: 225 });
  });

  it("returns null for invalid values", () => {
    expect(parseColor("")).toBeNull();
    expect(parseColor("not-a-color")).toBeNull();
    expect(parseColor("#gg0000")).toBeNull();
    expect(parseColor("var(--unknown)", () => null)).toBeNull();
  });
});

describe("relativeLuminance / contrastRatio", () => {
  it("computes black and white luminance", () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });

  it("computes black/white contrast near 21", () => {
    expect(
      contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }),
    ).toBeCloseTo(21, 0);
  });
});

describe("pickContrastingTextColor", () => {
  it("picks black on light backgrounds", () => {
    expect(pickContrastingTextColor("#ffffff")).toBe("#000000");
    expect(pickContrastingTextColor("#e1e1e1")).toBe("#000000");
  });

  it("picks white on dark backgrounds", () => {
    expect(pickContrastingTextColor("#000000")).toBe("#ffffff");
    expect(pickContrastingTextColor("#3b3b3b")).toBe("#ffffff");
  });

  it("uses resolveVar for CSS variables", () => {
    expect(
      pickContrastingTextColor("var(--tw-bg-button-optional)", () => "#e1e1e1"),
    ).toBe("#000000");
  });

  it("falls back when background is unparsable", () => {
    expect(pickContrastingTextColor("nope")).toBe("#000000");
  });
});
