import { beforeEach, describe, expect, it } from "vitest";
import { getEventName, getPrefix, setPrefix } from "./prefix.js";

describe("setPrefix / getPrefix", () => {
  beforeEach(() => {
    setPrefix("tw-");
  });

  it("returns default prefix tw-", () => {
    expect(getPrefix()).toBe("tw-");
  });

  it("appends trailing hyphen when missing", () => {
    setPrefix("app");
    expect(getPrefix()).toBe("app-");
  });

  it("does not double the trailing hyphen", () => {
    setPrefix("app-");
    expect(getPrefix()).toBe("app-");
  });

  it("falls back to tw- for empty string", () => {
    setPrefix("");
    expect(getPrefix()).toBe("tw-");
  });

  it("falls back to tw- for whitespace-only string", () => {
    setPrefix("   ");
    expect(getPrefix()).toBe("tw-");
  });
});

describe("getEventName", () => {
  beforeEach(() => {
    setPrefix("tw-");
  });

  it("prefixes event name with default prefix", () => {
    expect(getEventName("open")).toBe("tw-open");
  });

  it("uses current prefix", () => {
    setPrefix("app");
    expect(getEventName("close")).toBe("app-close");
  });

  it("prefixes only once for compound names", () => {
    expect(getEventName("modal-open")).toBe("tw-modal-open");
  });

  it("returns empty string for empty name", () => {
    expect(getEventName("")).toBe("");
  });
});
