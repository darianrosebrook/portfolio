/**
 * Debounce function calls to limit execution frequency.
 *
 * Delays function execution until after a specified wait time has elapsed
 * since the last time the debounced function was invoked. Useful for
 * optimizing performance in scenarios like search input, window resizing, etc.
 *
 * @template T - The function type to debounce
 * @param fn - The function to debounce
 * @param ms - The number of milliseconds to delay
 * @returns A debounced version of the input function
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 *
 * // Will only execute 300ms after the last call
 * debouncedSearch('hello');
 * debouncedSearch('world');
 * ```
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: Parameters<T>) {
    const fnCall = () => fn.apply(this, args);
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
};
