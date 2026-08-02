export function getFirstGrapheme(name: unknown): string {
  if (name == null) return "";
  const value = String(name);
  if (!value) return "";

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    const first = segmenter.segment(value)[Symbol.iterator]().next().value;
    return first?.segment ?? "";
  }

  return Array.from(value)[0] ?? "";
}
