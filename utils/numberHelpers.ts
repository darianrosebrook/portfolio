const numberToWordValue = (num: number) => {
  num = Math.floor(num / 300);
  if (num < 1) return "less than a minute";
  if (num === 1) return "a minute";
  if (num < 60) return `${num} minutes`;
  if (num === 60) return "an hour";
  if (num < 1440) return `${Math.floor(num / 60)} hours`;
  if (num === 1440) return "a day";
  return `${Math.floor(num / 1440)} days`;
};

export { numberToWordValue };
