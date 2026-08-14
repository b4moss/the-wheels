import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_STORAGE_KEY,
  DEFAULT_TTL_DAYS,
  acceptAllState,
  createPendingState,
  dismissBannerState,
  expiresAtFromNow,
  isExpired,
  normalizeStorageKey,
  normalizeTtlDays,
  parseConsentState,
  readConsent,
  removeConsent,
  setServiceInState,
  slideExpiresAt,
  statusFromServices,
  parseServiceIds,
  writeConsent,
} from "./storage.js";

describe("cookie consent storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("normalizeStorageKey falls back to default on empty", () => {
    expect(normalizeStorageKey(null)).toBe(DEFAULT_STORAGE_KEY);
    expect(normalizeStorageKey("")).toBe(DEFAULT_STORAGE_KEY);
    expect(normalizeStorageKey("  ")).toBe(DEFAULT_STORAGE_KEY);
    expect(normalizeStorageKey("app-consent")).toBe("app-consent");
  });

  it("normalizeTtlDays defaults and rejects invalid values", () => {
    expect(normalizeTtlDays(null)).toBe(DEFAULT_TTL_DAYS);
    expect(normalizeTtlDays("")).toBe(DEFAULT_TTL_DAYS);
    expect(normalizeTtlDays("abc")).toBe(DEFAULT_TTL_DAYS);
    expect(normalizeTtlDays("0")).toBe(DEFAULT_TTL_DAYS);
    expect(normalizeTtlDays("-1")).toBe(DEFAULT_TTL_DAYS);
    expect(normalizeTtlDays("30")).toBe(30);
  });

  it("isExpired treats now >= expiresAt as expired", () => {
    const at = new Date("2026-01-01T00:00:00.000Z");
    expect(
      isExpired({ expiresAt: "2026-01-01T00:00:00.000Z" }, at),
    ).toBe(true);
    expect(
      isExpired({ expiresAt: "2026-01-01T00:00:00.001Z" }, at),
    ).toBe(false);
    expect(
      isExpired({ expiresAt: "2025-12-31T23:59:59.999Z" }, at),
    ).toBe(true);
  });

  it("createPendingState writes pending with expiresAt ~ ttl days out", () => {
    const now = new Date("2026-08-02T00:00:00.000Z");
    const state = createPendingState(30, now);
    expect(state.status).toBe("pending");
    expect(state.bannerHidden).toBe(false);
    expect(state.services).toEqual({});
    expect(state.expiresAt).toBe(expiresAtFromNow(30, now));
  });

  it("acceptAllState sets accepted and bannerHidden; fills known service ids", () => {
    const now = new Date("2026-08-02T00:00:00.000Z");
    const base = createPendingState(365, now);
    base.services = { analytics: false };
    const next = acceptAllState(base, 365, now, ["analytics", "ads"]);
    expect(next.status).toBe("accepted");
    expect(next.bannerHidden).toBe(true);
    expect(next.services).toEqual({ analytics: true, ads: true });
  });

  it("acceptAllState with no known ids leaves empty services empty", () => {
    const now = new Date("2026-08-02T00:00:00.000Z");
    const base = createPendingState(365, now);
    const next = acceptAllState(base, 365, now, []);
    expect(next.services).toEqual({});
  });

  it("parseServiceIds splits comma list", () => {
    expect(parseServiceIds(null)).toEqual([]);
    expect(parseServiceIds(" analytics, ads ,personalization ")).toEqual([
      "analytics",
      "ads",
      "personalization",
    ]);
  });

  it("dismissBannerState hides banner without accepting", () => {
    const base = createPendingState(365);
    const next = dismissBannerState(base);
    expect(next.status).toBe("pending");
    expect(next.bannerHidden).toBe(true);
  });

  it("slideExpiresAt extends from now", () => {
    const now = new Date("2026-08-02T00:00:00.000Z");
    const base = createPendingState(10, new Date("2026-07-01T00:00:00.000Z"));
    const next = slideExpiresAt(base, 10, now);
    expect(Date.parse(next.expiresAt)).toBeGreaterThan(
      Date.parse(base.expiresAt),
    );
    expect(next.status).toBe(base.status);
  });

  it("setServiceInState ignores empty id", () => {
    const base = createPendingState(365);
    expect(setServiceInState(base, "", true)).toBe(base);
    expect(setServiceInState(base, "ads", false).services.ads).toBe(false);
  });

  it("statusFromServices: empty → null, any true → partial, all false → rejected", () => {
    expect(statusFromServices({})).toBeNull();
    expect(statusFromServices({ a: true })).toBe("partial");
    expect(statusFromServices({ a: true, b: false })).toBe("partial");
    expect(statusFromServices({ a: false, b: false })).toBe("rejected");
  });

  it("setServiceInState derives partial / rejected (and demotes accepted)", () => {
    const now = new Date("2026-08-02T00:00:00.000Z");
    let state = acceptAllState(createPendingState(365, now), 365, now);
    expect(state.status).toBe("accepted");

    state = setServiceInState(state, "analytics", true);
    expect(state.status).toBe("partial");
    expect(state.services.analytics).toBe(true);

    state = setServiceInState(state, "ads", false);
    expect(state.status).toBe("partial");

    state = setServiceInState(state, "analytics", false);
    expect(state.status).toBe("rejected");
    expect(state.services).toEqual({ analytics: false, ads: false });
  });

  it("parseConsentState accepts partial and rejected", () => {
    const raw = JSON.stringify({
      status: "partial",
      bannerHidden: true,
      services: { analytics: true },
      expiresAt: "2027-01-01T00:00:00.000Z",
    });
    expect(parseConsentState(raw)?.status).toBe("partial");
    expect(
      parseConsentState(
        JSON.stringify({
          status: "rejected",
          bannerHidden: true,
          services: { ads: false },
          expiresAt: "2027-01-01T00:00:00.000Z",
        }),
      )?.status,
    ).toBe("rejected");
  });

  it("parse / read / write / remove round-trip", () => {
    const state = createPendingState(365);
    expect(writeConsent(localStorage, "k", state)).toBe(true);
    expect(readConsent(localStorage, "k")).toEqual(state);
    expect(parseConsentState("not-json")).toBeNull();
    removeConsent(localStorage, "k");
    expect(readConsent(localStorage, "k")).toBeNull();
  });
});
