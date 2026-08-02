export type WindowItemValue = string | number;

export type WindowItem = {
  value: WindowItemValue;
  [key: string]: unknown;
};

export type SortDirection = "asc" | "desc";

function compareSortValues(
  a: unknown,
  b: unknown,
  direction: SortDirection,
): number {
  const aMissing = a == null;
  const bMissing = b == null;
  // Missing sortKey → push to end (stable relative order among missing).
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;

  let cmp = 0;
  if (typeof a === "number" && typeof b === "number") {
    cmp = a - b;
  } else {
    cmp = String(a).localeCompare(String(b), undefined, { numeric: true });
  }
  return direction === "asc" ? cmp : -cmp;
}

/**
 * Merge by `value` (incoming wins), then sort by `sortKey`.
 * Items missing `sortKey` are sorted to the end.
 */
export function mergeWindowItems<T extends WindowItem>(
  existing: readonly T[],
  incoming: readonly T[],
  sortKey: string,
  sortDirection: SortDirection = "desc",
): T[] {
  const map = new Map<string, T>();
  for (const item of existing) {
    map.set(String(item.value), item);
  }
  for (const item of incoming) {
    map.set(String(item.value), item);
  }
  const merged = Array.from(map.values());
  merged.sort((a, b) =>
    compareSortValues(a[sortKey], b[sortKey], sortDirection),
  );
  return merged;
}

/**
 * Trim a sorted window to `maxItems`.
 * When overflowing after a down-load, drop from the start (sort head / top).
 * `maxItems <= 0` → empty array (no throw).
 */
export function trimWindowItems<T>(
  items: readonly T[],
  maxItems: number,
  overflowEdge: "start" | "end" = "start",
): T[] {
  if (maxItems <= 0) return [];
  if (items.length <= maxItems) return items.slice();
  if (overflowEdge === "start") {
    return items.slice(items.length - maxItems);
  }
  return items.slice(0, maxItems);
}

export function normalizeSortDirection(
  value: string | null | undefined,
): SortDirection {
  if (value === "asc" || value === "desc") return value;
  return "desc";
}

export const DEFAULT_MAX_ITEMS = 100;

export function normalizeMaxItems(
  value: string | null | undefined,
): number {
  if (value == null || value === "") return DEFAULT_MAX_ITEMS;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MAX_ITEMS;
  return Math.floor(n);
}
