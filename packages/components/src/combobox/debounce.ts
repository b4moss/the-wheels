export type DebouncedFn<T extends unknown[]> = ((...args: T) => void) & {
  cancel: () => void;
  flush: () => void;
};

/** Leading-edge-safe trailing debounce. delay <= 0 runs on next microtask. */
export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  delayMs: number,
): DebouncedFn<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: T | null = null;

  const clear = (): void => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const invoke = (): void => {
    timer = null;
    if (!pending) return;
    const args = pending;
    pending = null;
    fn(...args);
  };

  const wrapped = ((...args: T) => {
    pending = args;
    clear();
    if (delayMs <= 0) {
      queueMicrotask(invoke);
      return;
    }
    timer = setTimeout(invoke, delayMs);
  }) as DebouncedFn<T>;

  wrapped.cancel = () => {
    clear();
    pending = null;
  };

  wrapped.flush = () => {
    if (pending) {
      clear();
      invoke();
    }
  };

  return wrapped;
}
