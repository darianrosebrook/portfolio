/**
 * Throttle function calls to limit execution frequency.
 *
 * Ensures that a function is called at most once within a specified time period.
 * Subsequent calls within the throttle period are ignored. Useful for
 * optimizing performance in scenarios like scroll events, mousemove, etc.
 *
 * @param func - The function to throttle
 * @param limit - The minimum time (in milliseconds) between function executions
 * @returns A throttled version of the input function
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   console.log('Scroll event fired');
 * }, 100);
 *
 * // Will execute at most once every 100ms during scroll
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export const throttle = (func: (...args: unknown[]) => void, limit: number) => {
  let inThrottle: boolean;
  return (...args: unknown[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
