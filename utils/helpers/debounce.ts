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
