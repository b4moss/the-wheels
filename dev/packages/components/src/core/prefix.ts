const DEFAULT_PREFIX = "tw-";

let prefix = DEFAULT_PREFIX;

function normalizePrefix(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_PREFIX;
  return trimmed.endsWith("-") ? trimmed : `${trimmed}-`;
}

export function setPrefix(value: string): void {
  prefix = normalizePrefix(value);
}

export function getPrefix(): string {
  return prefix;
}

export function getEventName(name: string): string {
  if (!name) return "";
  return `${getPrefix()}${name}`;
}
