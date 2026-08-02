import {
  flip,
  offset,
  shift,
  type Middleware,
  type Placement,
} from "@floating-ui/dom";

export const DEFAULT_PLACEMENT: Placement = "bottom-start";

const PLACEMENTS = new Set<string>([
  "top",
  "top-start",
  "top-end",
  "right",
  "right-start",
  "right-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
]);

export function normalizePlacement(
  value: string | null | undefined,
): Placement {
  if (value == null) return DEFAULT_PLACEMENT;
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_PLACEMENT;
  if (!PLACEMENTS.has(trimmed)) return DEFAULT_PLACEMENT;
  return trimmed as Placement;
}

export function createDropdownMiddleware(): Middleware[] {
  return [offset(8), flip(), shift({ padding: 8 })];
}
