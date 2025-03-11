'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Having some trouble loading this content...</h2>
        <button onClick={() => reset()}>Try again</button>
        <pre>{error.message}</pre>
        <Link href="/">Go back home</Link>
      </body>
    </html>
  );
}
