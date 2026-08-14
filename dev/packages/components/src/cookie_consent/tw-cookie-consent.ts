import { defineComponent } from "../core/register.js";
import {
  createSnackbarLayer,
  type SnackbarLayer,
} from "../snackbar_layer/snackbar-layer.js";
import {
  acceptAllState,
  createPendingState,
  dismissBannerState,
  isExpired,
  normalizeStorageKey,
  normalizeTtlDays,
  parseServiceIds,
  readConsent,
  removeConsent,
  setServiceInState,
  slideExpiresAt,
  writeConsent,
  type CookieConsentState,
} from "./storage.js";

export class TwCookieConsent extends HTMLElement {
  static observedAttributes = ["storage-key", "ttl-days", "service-ids"];

  #layer: SnackbarLayer | null = null;
  #banner: HTMLElement | null = null;
  #state: CookieConsentState | null = null;
  #initialized = false;
  #projecting = false;
  #observer: MutationObserver | null = null;

  #onClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-tw-cookie-accept-all]")) {
      event.preventDefault();
      this.acceptAll();
      return;
    }
    if (target.closest("[data-tw-cookie-settings]")) {
      // Settings navigates via href on <a>; still dismiss the banner.
      this.dismissBanner();
    }
  };

  connectedCallback(): void {
    this.setAttribute("data-tw-component", "cookie-consent");
    this.#ensureStructure();
    this.#bindDelegation();
    this.#observeSlots();
    this.#syncFromStorage();
    queueMicrotask(() => {
      if (!this.isConnected) return;
      this.#projectSlots();
    });
    this.#initialized = true;
  }

  disconnectedCallback(): void {
    this.#banner?.removeEventListener("click", this.#onClick);
    this.#observer?.disconnect();
    this.#observer = null;
    this.#layer?.destroy();
    this.#layer = null;
    this.#banner = null;
  }

  attributeChangedCallback(name: string): void {
    if (!this.#initialized || !this.isConnected) return;
    if (name === "storage-key" || name === "ttl-days") {
      this.#syncFromStorage();
    }
  }

  acceptAll(): void {
    this.#ensureState();
    if (!this.#state) return;
    const ttl = this.#ttlDays();
    this.#state = acceptAllState(
      this.#state,
      ttl,
      new Date(),
      this.#knownServiceIds(),
    );
    this.#persist();
    this.#applyVisibility();
  }

  dismissBanner(): void {
    this.#ensureState();
    if (!this.#state) return;
    this.#state = dismissBannerState(this.#state);
    this.#persist();
    this.#applyVisibility();
  }

  setServiceConsent(id: string, allowed: boolean): void {
    if (id === "") return;
    this.#ensureState();
    if (!this.#state) return;
    this.#state = setServiceInState(this.#state, id, allowed);
    this.#persist();
  }

  getServiceConsent(id: string): boolean | undefined {
    if (id === "") return undefined;
    this.#ensureState();
    if (!this.#state) return undefined;
    if (!(id in this.#state.services)) return undefined;
    return this.#state.services[id];
  }

  getAllServiceConsents(): Record<string, boolean> {
    this.#ensureState();
    return { ...(this.#state?.services ?? {}) };
  }

  /** Expose for tests / debugging. */
  getSnackbarLayer(): SnackbarLayer | null {
    return this.#layer;
  }

  /** Expose current in-memory state for tests. */
  getConsentState(): CookieConsentState | null {
    return this.#state ? { ...this.#state, services: { ...this.#state.services } } : null;
  }

  #storageKey(): string {
    return normalizeStorageKey(this.getAttribute("storage-key"));
  }

  #ttlDays(): number {
    return normalizeTtlDays(this.getAttribute("ttl-days"));
  }

  #knownServiceIds(): string[] {
    return parseServiceIds(this.getAttribute("service-ids"));
  }

  #getStorage(): Storage | null {
    try {
      const s = globalThis.localStorage;
      const probe = "__tw_cookie_probe__";
      s.setItem(probe, "1");
      s.removeItem(probe);
      return s;
    } catch {
      return null;
    }
  }

  #ensureStructure(): void {
    if (this.#layer && this.#banner) return;

    const banner = document.createElement("div");
    banner.className = "cookie-consent-banner";

    this.#banner = banner;
    this.#projectSlots();

    this.#layer = createSnackbarLayer({
      parent: this,
      content: banner,
    });
  }

  #bindDelegation(): void {
    this.#banner?.addEventListener("click", this.#onClick);
  }

  #observeSlots(): void {
    if (this.#observer) return;
    this.#observer = new MutationObserver(() => {
      if (this.#projecting) return;
      this.#projectSlots();
    });
    this.#observer.observe(this, { childList: true });
  }

  #projectSlots(): void {
    if (!this.#banner || this.#projecting) return;
    this.#projecting = true;

    const nodes = Array.from(this.childNodes).filter((node) => {
      if (node === this.#layer?.element) return false;
      return true;
    });

    const content: Node[] = [];
    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const slot = el.getAttribute("slot");
        if (slot != null && slot !== "" && slot !== "content") continue;
        content.push(node);
        continue;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        if ((node.textContent ?? "").trim() === "") continue;
        content.push(node);
      }
    }

    if (content.length) {
      this.#banner.append(...content);
    }

    this.#projecting = false;
  }

  #ensureState(): void {
    if (this.#state) return;
    this.#state = createPendingState(this.#ttlDays());
  }

  #persist(): void {
    if (!this.#state) return;
    const storage = this.#getStorage();
    if (!storage) return;
    writeConsent(storage, this.#storageKey(), this.#state);
  }

  #syncFromStorage(): void {
    const ttl = this.#ttlDays();
    const key = this.#storageKey();
    const storage = this.#getStorage();
    const now = new Date();

    if (!storage) {
      // Fallback: show banner in memory only.
      this.#state = createPendingState(ttl, now);
      this.#applyVisibility();
      return;
    }

    let state = readConsent(storage, key);

    if (!state) {
      state = createPendingState(ttl, now);
      writeConsent(storage, key, state);
      this.#state = state;
      this.#applyVisibility();
      return;
    }

    if (isExpired(state, now)) {
      removeConsent(storage, key);
      state = createPendingState(ttl, now);
      writeConsent(storage, key, state);
      this.#state = state;
      this.#applyVisibility();
      return;
    }

    // Sliding TTL on connect when still valid; status / bannerHidden unchanged.
    state = slideExpiresAt(state, ttl, now);
    writeConsent(storage, key, state);
    this.#state = state;
    this.#applyVisibility();
  }

  #applyVisibility(): void {
    if (!this.#layer) this.#ensureStructure();
    if (!this.#layer || !this.#state) return;

    if (this.#state.bannerHidden) {
      this.#layer.hide();
    } else {
      this.#layer.show();
    }
  }
}

defineComponent("cookie-consent", TwCookieConsent);
