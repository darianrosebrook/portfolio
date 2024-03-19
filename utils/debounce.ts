const debounce = (fn: Function, ms: number) => {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: any[]) {
    const fnCall = () => fn.apply(this, args);
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
};

export default debounce;
