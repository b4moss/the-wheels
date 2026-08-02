export type Rgb = { r: number; g: number; b: number };

const DEFAULT_BG = "#e1e1e1"; // --tw-bg-button-optional

function clampByte(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(255, Math.max(0, Math.round(n)));
}

export function parseColor(
  input: string,
  resolveVar?: (value: string) => string | null,
): Rgb | null {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw) return null;

  let value = raw;
  if (/^var\(/i.test(value)) {
    const resolved = resolveVar?.(value) ?? null;
    if (!resolved) return null;
    value = resolved.trim();
  }

  const short = /^#([0-9a-f]{3})$/i.exec(value);
  if (short) {
    const [r, g, b] = short[1].split("").map((c) => parseInt(c + c, 16));
    return { r, g, b };
  }

  const long = /^#([0-9a-f]{6})$/i.exec(value);
  if (long) {
    const hex = long[1];
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
}

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(rgb: Rgb): number {
  const r = channelLuminance(clampByte(rgb.r));
  const g = channelLuminance(clampByte(rgb.g));
  const b = channelLuminance(clampByte(rgb.b));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function pickContrastingTextColor(
  background: string,
  resolveVar?: (value: string) => string | null,
): "#000000" | "#ffffff" {
  const parsed =
    parseColor(background, resolveVar) ?? parseColor(DEFAULT_BG) ?? {
      r: 225,
      g: 225,
      b: 225,
    };
  const black: Rgb = { r: 0, g: 0, b: 0 };
  const white: Rgb = { r: 255, g: 255, b: 255 };
  const blackRatio = contrastRatio(parsed, black);
  const whiteRatio = contrastRatio(parsed, white);
  return blackRatio >= whiteRatio ? "#000000" : "#ffffff";
}

export const DEFAULT_AVATAR_BG = DEFAULT_BG;
