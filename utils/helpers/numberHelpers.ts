function calculateReadingTime(wordCount) {
  const wordsPerMinute = 300;
  const minutes = Math.floor(wordCount / wordsPerMinute);

  if (minutes < 1) return 'less than a minute';
  if (minutes === 1) return 'a minute';
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes === 60) return 'an hour';

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (hours === 24) return 'a day';

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
}

export { calculateReadingTime };
