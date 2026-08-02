import type { ComboboxOption } from "./types.js";

/** Case-insensitive substring match on `label` (falls back to String(value)). */
export function filterOptionsByQuery(
  options: ComboboxOption[],
  query: string,
): ComboboxOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options.slice();
  return options.filter((opt) => {
    const label =
      typeof opt.label === "string" && opt.label.length > 0
        ? opt.label
        : String(opt.value);
    return label.toLowerCase().includes(q);
  });
}

export function optionLabel(option: ComboboxOption): string {
  if (typeof option.label === "string") return option.label;
  return String(option.value ?? "");
}
