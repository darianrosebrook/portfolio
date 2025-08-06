const debounce = <T extends (...args: any[]) => void>(fn: T, ms: number): T => {
  let timeout: NodeJS.Timeout;
  const debouncedFn = function (this: unknown, ...args: any[]) {
    const fnCall = () => fn.apply(this, args);
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
  return debouncedFn as unknown as T;
};

export { debounce };
