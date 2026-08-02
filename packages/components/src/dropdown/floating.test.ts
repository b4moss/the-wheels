import { describe, expect, it } from "vitest";
import {
  createDropdownMiddleware,
  normalizePlacement,
} from "./floating.js";

describe("normalizePlacement", () => {
  it("defaults undefined / null / empty to bottom-start", () => {
    expect(normalizePlacement(undefined)).toBe("bottom-start");
    expect(normalizePlacement(null)).toBe("bottom-start");
    expect(normalizePlacement("")).toBe("bottom-start");
  });

  it("returns valid placements as-is", () => {
    expect(normalizePlacement("bottom-start")).toBe("bottom-start");
    expect(normalizePlacement("top-end")).toBe("top-end");
    expect(normalizePlacement("right")).toBe("right");
  });

  it("falls back invalid / whitespace-only values", () => {
    expect(normalizePlacement("diagonal")).toBe("bottom-start");
    expect(normalizePlacement("   ")).toBe("bottom-start");
  });
});

describe("createDropdownMiddleware", () => {
  it("returns offset(8), flip, and shift({ padding: 8 })", () => {
    const middleware = createDropdownMiddleware();
    expect(middleware).toHaveLength(3);
    expect(middleware[0]?.name).toBe("offset");
    expect(middleware[1]?.name).toBe("flip");
    expect(middleware[2]?.name).toBe("shift");
  });
});
