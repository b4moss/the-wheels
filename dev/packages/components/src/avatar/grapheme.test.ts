import { describe, expect, it } from "vitest";
import { getFirstGrapheme } from "./grapheme.js";

describe("getFirstGrapheme", () => {
  it('returns "山" for Japanese name', () => {
    expect(getFirstGrapheme("山田太郎")).toBe("山");
  });

  it("returns first Latin letter", () => {
    expect(getFirstGrapheme("Alice")).toBe("A");
  });

  it("treats flag emoji as one grapheme", () => {
    expect(getFirstGrapheme("🇯🇵")).toBe("🇯🇵");
  });

  it("treats ZWJ emoji sequence as one grapheme", () => {
    expect(getFirstGrapheme("👨‍👩‍👧‍👦")).toBe("👨‍👩‍👧‍👦");
  });

  it("returns empty string for empty input", () => {
    expect(getFirstGrapheme("")).toBe("");
  });

  it("does not trim leading whitespace", () => {
    expect(getFirstGrapheme("   ")).toBe(" ");
  });

  it("returns empty string for nullish", () => {
    expect(getFirstGrapheme(null)).toBe("");
    expect(getFirstGrapheme(undefined)).toBe("");
  });
});
