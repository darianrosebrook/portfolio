const debounce = (fn: (...args: unknown[]) => void, ms: number) => {
  let timeout: NodeJS.Timeout;
  return function (this: unknown, ...args: unknown[]) {
    const fnCall = () => fn.apply(this, args);
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
};

export { debounce };
