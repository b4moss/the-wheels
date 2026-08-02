export const DEFAULT_STORAGE_KEY = "tw-cookie-consent";
export const DEFAULT_TTL_DAYS = 365;

export type CookieConsentStatus =
  | "pending"
  | "accepted"
  | "partial"
  | "rejected";

export type CookieConsentState = {
  status: CookieConsentStatus;
  bannerHidden: boolean;
  services: Record<string, boolean>;
  expiresAt: string;
};

const STATUS_VALUES: ReadonlySet<string> = new Set([
  "pending",
  "accepted",
  "partial",
  "rejected",
]);

/**
 * Derive status from per-service choices.
 * - empty `services` → caller should not use this for blanket `accepted`
 * - any `true` → `partial`
 * - one or more keys, all `false` → `rejected`
 */
export function statusFromServices(
  services: Record<string, boolean>,
): "partial" | "rejected" | null {
  const keys = Object.keys(services);
  if (keys.length === 0) return null;
  if (keys.some((k) => services[k] === true)) return "partial";
  return "rejected";
}

export function normalizeStorageKey(raw: string | null | undefined): string {
  if (raw == null || raw.trim() === "") return DEFAULT_STORAGE_KEY;
  return raw;
}

export function normalizeTtlDays(raw: string | null | undefined): number {
  if (raw == null || raw.trim() === "") return DEFAULT_TTL_DAYS;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_TTL_DAYS;
  return n;
}

export function expiresAtFromNow(
  ttlDays: number,
  now: Date = new Date(),
): string {
  const ms = ttlDays * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() + ms).toISOString();
}

export function createPendingState(
  ttlDays: number,
  now: Date = new Date(),
): CookieConsentState {
  return {
    status: "pending",
    bannerHidden: false,
    services: {},
    expiresAt: expiresAtFromNow(ttlDays, now),
  };
}

/**
 * Expired when now >= expiresAt (inclusive boundary = expired).
 */
export function isExpired(
  state: Pick<CookieConsentState, "expiresAt">,
  now: Date = new Date(),
): boolean {
  const t = Date.parse(state.expiresAt);
  if (!Number.isFinite(t)) return true;
  return now.getTime() >= t;
}

export function parseConsentState(raw: string | null): CookieConsentState | null {
  if (raw == null || raw === "") return null;
  try {
    const data = JSON.parse(raw) as Partial<CookieConsentState>;
    if (data == null || typeof data !== "object") return null;
    const status = STATUS_VALUES.has(data.status as string)
      ? (data.status as CookieConsentStatus)
      : "pending";
    const bannerHidden = Boolean(data.bannerHidden);
    const services =
      data.services && typeof data.services === "object" && !Array.isArray(data.services)
        ? { ...data.services }
        : {};
    const expiresAt =
      typeof data.expiresAt === "string" && data.expiresAt !== ""
        ? data.expiresAt
        : "";
    if (!expiresAt) return null;
    return { status, bannerHidden, services, expiresAt };
  } catch {
    return null;
  }
}

export function readConsent(
  storage: Storage,
  key: string,
): CookieConsentState | null {
  try {
    return parseConsentState(storage.getItem(key));
  } catch {
    return null;
  }
}

export function writeConsent(
  storage: Storage,
  key: string,
  state: CookieConsentState,
): boolean {
  try {
    storage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function removeConsent(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

export function slideExpiresAt(
  state: CookieConsentState,
  ttlDays: number,
  now: Date = new Date(),
): CookieConsentState {
  return {
    ...state,
    expiresAt: expiresAtFromNow(ttlDays, now),
  };
}

export function parseServiceIds(raw: string | null | undefined): string[] {
  if (raw == null || raw.trim() === "") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

export function acceptAllState(
  state: CookieConsentState,
  ttlDays: number,
  now: Date = new Date(),
  knownServiceIds: readonly string[] = [],
): CookieConsentState {
  const services = { ...state.services };
  const ids = new Set<string>([
    ...knownServiceIds.filter((id) => id !== ""),
    ...Object.keys(services),
  ]);
  for (const id of ids) {
    services[id] = true;
  }
  return {
    ...state,
    status: "accepted",
    bannerHidden: true,
    services,
    expiresAt: expiresAtFromNow(ttlDays, now),
  };
}

export function dismissBannerState(
  state: CookieConsentState,
): CookieConsentState {
  return {
    ...state,
    bannerHidden: true,
    // status stays as-is (typically pending)
  };
}

export function setServiceInState(
  state: CookieConsentState,
  id: string,
  allowed: boolean,
): CookieConsentState {
  if (id === "") return state;
  const services = { ...state.services, [id]: allowed };
  const derived = statusFromServices(services);
  return {
    ...state,
    services,
    // Individual service edits leave blanket `accepted` and become partial/rejected.
    status: derived ?? state.status,
  };
}
