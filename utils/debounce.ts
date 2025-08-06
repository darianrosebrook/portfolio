const debounce = <T extends (...args: any[]) => void>(fn: T, ms: number) => {
  let timeout: NodeJS.Timeout;
  return function (this: unknown, ...args: Parameters<T>) {
    const fnCall = () => fn.apply(this, args);
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
};

export { debounce };
