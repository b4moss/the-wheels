import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setPrefix } from "../core/prefix.js";
import { defineComponent } from "../core/register.js";
import { SNACKBAR_LAYER_ATTR } from "../snackbar_layer/snackbar-layer.js";
import {
  DEFAULT_STORAGE_KEY,
  createPendingState,
  expiresAtFromNow,
  writeConsent,
} from "./storage.js";
import { TwCookieConsent } from "./tw-cookie-consent.js";

function mountCookieConsent(
  attrs: Record<string, string> = {},
  children: Node[] = [],
): TwCookieConsent {
  const node = document.createElement("tw-cookie-consent") as TwCookieConsent;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === "") node.setAttribute(key, "");
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  document.body.append(node);
  return node;
}

function el(html: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.innerHTML = html.trim();
  return wrap.firstElementChild as HTMLElement;
}

function readJson(key = DEFAULT_STORAGE_KEY): Record<string, unknown> {
  return JSON.parse(localStorage.getItem(key)!);
}

describe("TwCookieConsent", () => {
  beforeEach(() => {
    setPrefix("tw-");
    defineComponent("cookie-consent", TwCookieConsent);
    localStorage.clear();
  });

  afterEach(() => {
    document.body.replaceChildren();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("sets data-tw-component=cookie-consent on connect", () => {
    const node = mountCookieConsent();
    expect(node.getAttribute("data-tw-component")).toBe("cookie-consent");
  });

  describe("first connect (missing key)", () => {
    it("writes pending JSON and shows banner via snackbar layer", () => {
      const before = Date.now();
      const node = mountCookieConsent();
      const after = Date.now();

      const raw = localStorage.getItem(DEFAULT_STORAGE_KEY);
      expect(raw).not.toBeNull();
      const data = JSON.parse(raw!);
      expect(data.status).toBe("pending");
      expect(data.bannerHidden).toBe(false);
      expect(data.services).toEqual({});

      const expires = Date.parse(data.expiresAt);
      const expectedMin = before + 365 * 24 * 60 * 60 * 1000 - 5000;
      const expectedMax = after + 365 * 24 * 60 * 60 * 1000 + 5000;
      expect(expires).toBeGreaterThanOrEqual(expectedMin);
      expect(expires).toBeLessThanOrEqual(expectedMax);

      const layer = node.getSnackbarLayer()!;
      expect(layer.element.getAttribute(SNACKBAR_LAYER_ATTR)).toBe("");
      expect(layer.isVisible()).toBe(true);
    });
  });

  describe("storage-key", () => {
    it("reads/writes the custom key and leaves the default untouched", () => {
      mountCookieConsent({ "storage-key": "app-consent" });
      expect(localStorage.getItem("app-consent")).not.toBeNull();
      expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBeNull();
    });

    it("falls back to default key when storage-key is empty", () => {
      mountCookieConsent({ "storage-key": "" });
      expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).not.toBeNull();
    });
  });

  describe("ttl-days", () => {
    it("uses 30 days when ttl-days=30", () => {
      const before = Date.now();
      mountCookieConsent({ "ttl-days": "30" });
      const after = Date.now();
      const expires = Date.parse(readJson().expiresAt as string);
      expect(expires).toBeGreaterThanOrEqual(
        before + 30 * 24 * 60 * 60 * 1000 - 5000,
      );
      expect(expires).toBeLessThanOrEqual(
        after + 30 * 24 * 60 * 60 * 1000 + 5000,
      );
    });

    it("falls back to 365 for invalid ttl-days", () => {
      const before = Date.now();
      mountCookieConsent({ "ttl-days": "0" });
      const after = Date.now();
      const expires = Date.parse(readJson().expiresAt as string);
      expect(expires).toBeGreaterThanOrEqual(
        before + 365 * 24 * 60 * 60 * 1000 - 5000,
      );
      expect(expires).toBeLessThanOrEqual(
        after + 365 * 24 * 60 * 60 * 1000 + 5000,
      );
    });
  });

  describe("acceptAll", () => {
    it("sets accepted, hides banner, fills service-ids as true, refreshes expiresAt", () => {
      const node = mountCookieConsent({
        "service-ids": "analytics,ads,personalization",
      });
      writeConsent(localStorage, DEFAULT_STORAGE_KEY, {
        ...createPendingState(365),
        services: { analytics: false },
      });
      node.setAttribute("storage-key", DEFAULT_STORAGE_KEY);
      // reconnect sync — remount with existing storage
      node.remove();
      const node2 = mountCookieConsent({
        "service-ids": "analytics,ads,personalization",
      });

      const before = Date.now();
      node2.acceptAll();
      const after = Date.now();

      const data = readJson();
      expect(data.status).toBe("accepted");
      expect(data.bannerHidden).toBe(true);
      expect(data.services).toEqual({
        analytics: true,
        ads: true,
        personalization: true,
      });
      const expires = Date.parse(data.expiresAt as string);
      expect(expires).toBeGreaterThanOrEqual(
        before + 365 * 24 * 60 * 60 * 1000 - 5000,
      );
      expect(expires).toBeLessThanOrEqual(
        after + 365 * 24 * 60 * 60 * 1000 + 5000,
      );
      expect(node2.getSnackbarLayer()!.isVisible()).toBe(false);
      expect(node2.getServiceConsent("analytics")).toBe(true);
      expect(node2.getServiceConsent("ads")).toBe(true);
    });

    it("acceptAll via data-tw-cookie-accept-all delegation", () => {
      const btn = el(
        `<button type="button" data-tw-cookie-accept-all>すべて承諾</button>`,
      );
      const node = mountCookieConsent({}, [btn]);
      btn.click();
      expect(readJson().status).toBe("accepted");
      expect(node.getSnackbarLayer()!.isVisible()).toBe(false);
    });

    it("re-accept while already accepted keeps bannerHidden", () => {
      const node = mountCookieConsent();
      node.acceptAll();
      expect(() => node.acceptAll()).not.toThrow();
      expect(readJson().bannerHidden).toBe(true);
      expect(node.getSnackbarLayer()!.isVisible()).toBe(false);
    });
  });

  describe("dismissBanner (settings)", () => {
    it("hides banner while keeping pending status", () => {
      const link = el(
        `<a href="/settings/cookies" data-tw-cookie-settings>設定する</a>`,
      );
      const node = mountCookieConsent({}, [link]);
      link.click();
      const data = readJson();
      expect(data.status).toBe("pending");
      expect(data.bannerHidden).toBe(true);
      expect(node.getSnackbarLayer()!.isVisible()).toBe(false);
      expect(link.getAttribute("href")).toBe("/settings/cookies");
    });

    it("works without href", () => {
      const node = mountCookieConsent();
      expect(() => node.dismissBanner()).not.toThrow();
      expect(readJson().status).toBe("pending");
      expect(readJson().bannerHidden).toBe(true);
    });
  });

  describe("bannerHidden revisit", () => {
    it("does not show when bannerHidden is true", () => {
      writeConsent(localStorage, DEFAULT_STORAGE_KEY, {
        status: "pending",
        bannerHidden: true,
        services: {},
        expiresAt: expiresAtFromNow(365),
      });
      const node = mountCookieConsent();
      expect(node.getSnackbarLayer()!.isVisible()).toBe(false);
    });

    it("does not show when accepted and within TTL", () => {
      writeConsent(localStorage, DEFAULT_STORAGE_KEY, {
        status: "accepted",
        bannerHidden: true,
        services: {},
        expiresAt: expiresAtFromNow(365),
      });
      const node = mountCookieConsent();
      expect(node.getSnackbarLayer()!.isVisible()).toBe(false);
    });
  });

  describe("TTL sliding", () => {
    it("extends expiresAt on connect without changing status", () => {
      const oldExpiry = expiresAtFromNow(365, new Date(Date.now() - 10 * 24 * 60 * 60 * 1000));
      writeConsent(localStorage, DEFAULT_STORAGE_KEY, {
        status: "pending",
        bannerHidden: true,
        services: { ads: false },
        expiresAt: oldExpiry,
      });
      const before = Date.now();
      const node = mountCookieConsent();
      const after = Date.now();
      const data = readJson();
      expect(data.status).toBe("pending");
      expect(data.bannerHidden).toBe(true);
      expect(data.services).toEqual({ ads: false });
      const expires = Date.parse(data.expiresAt as string);
      expect(expires).toBeGreaterThan(Date.parse(oldExpiry));
      expect(expires).toBeGreaterThanOrEqual(
        before + 365 * 24 * 60 * 60 * 1000 - 5000,
      );
      expect(expires).toBeLessThanOrEqual(
        after + 365 * 24 * 60 * 60 * 1000 + 5000,
      );
      expect(node.getSnackbarLayer()!.isVisible()).toBe(false);
    });
  });

  describe("TTL expired", () => {
    it("resets storage to pending and reshown banner (now >= expiresAt)", () => {
      writeConsent(localStorage, DEFAULT_STORAGE_KEY, {
        status: "accepted",
        bannerHidden: true,
        services: { analytics: true, ads: false },
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      });
      const node = mountCookieConsent();
      const data = readJson();
      expect(data.status).toBe("pending");
      expect(data.bannerHidden).toBe(false);
      expect(data.services).toEqual({});
      expect(node.getSnackbarLayer()!.isVisible()).toBe(true);
    });
  });

  describe("service consent API", () => {
    it("set/get/getAll round-trip into storage and derives partial/rejected", () => {
      const node = mountCookieConsent();
      node.setServiceConsent("analytics", true);
      expect(readJson().status).toBe("partial");
      node.setServiceConsent("ads", false);
      expect(node.getServiceConsent("analytics")).toBe(true);
      expect(node.getServiceConsent("ads")).toBe(false);
      expect(node.getAllServiceConsents()).toEqual({
        analytics: true,
        ads: false,
      });
      expect(readJson().services).toEqual({ analytics: true, ads: false });
      expect(readJson().status).toBe("partial");

      node.setServiceConsent("analytics", false);
      expect(readJson().status).toBe("rejected");
      expect(readJson().services).toEqual({ analytics: false, ads: false });
    });

    it("demotes accepted to partial when a service is set", () => {
      const node = mountCookieConsent();
      node.acceptAll();
      expect(readJson().status).toBe("accepted");
      node.setServiceConsent("analytics", true);
      expect(readJson().status).toBe("partial");
    });

    it("returns undefined for unknown id; empty id is no-op", () => {
      const node = mountCookieConsent();
      expect(node.getServiceConsent("missing")).toBeUndefined();
      expect(() => node.setServiceConsent("", true)).not.toThrow();
      expect(node.getAllServiceConsents()).toEqual({});
    });
  });

  describe("slot content", () => {
    it("projects slotted content into the banner and works when empty", () => {
      const copy = el(`<p>Cookie を利用します</p>`);
      const node = mountCookieConsent({}, [copy]);
      expect(
        node.querySelector(".cookie-consent-banner")?.contains(copy),
      ).toBe(true);

      document.body.replaceChildren();
      localStorage.clear();
      expect(() => mountCookieConsent()).not.toThrow();
      expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).not.toBeNull();
    });
  });

  describe("snackbar layer / no Toast WC", () => {
    it("uses shared snackbar layer and does not register Toast", () => {
      const node = mountCookieConsent();
      expect(node.getSnackbarLayer()).not.toBeNull();
      expect(customElements.get("tw-toast")).toBeUndefined();
    });
  });

  describe("localStorage unavailable", () => {
    it("does not throw and still shows the banner", () => {
      const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota");
      });
      // getItem may still work; force both setItem and getItem via storage probe
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("denied");
      });
      let node: TwCookieConsent;
      expect(() => {
        node = mountCookieConsent();
      }).not.toThrow();
      expect(node!.getSnackbarLayer()!.isVisible()).toBe(true);
      spy.mockRestore();
    });
  });
});
