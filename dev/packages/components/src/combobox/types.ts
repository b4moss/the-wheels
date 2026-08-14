export type ComboboxOptionValue = string | number;

export type ComboboxOption = {
  value: ComboboxOptionValue;
  label?: string;
  disabled?: boolean;
  [key: string]: unknown;
};

export type ComboboxMode = "static" | "async" | "hybrid";

export type LoadDirection = "initial" | "up" | "down";

export type LoadOptionsContext = {
  query: string;
  page: number | string;
  signal: AbortSignal;
  direction?: LoadDirection;
};

export type LoadOptionsResult = {
  items: ComboboxOption[];
  hasMore: boolean;
  nextPage?: number | string;
};

export type LoadOptionsFn = (
  ctx: LoadOptionsContext,
) => Promise<LoadOptionsResult> | LoadOptionsResult;

export type RenderOptionFn = (
  option: ComboboxOption,
  selected: boolean,
) => Node;
