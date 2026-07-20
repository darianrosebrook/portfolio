'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="content">
      <h2>Something went wrong</h2>
      <p>This page hit an unexpected error. You can try again or head home.</p>
      {error.digest ? (
        <p className="small">
          Reference: <code>{error.digest}</code>
        </p>
      ) : null}
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
      <Link href="/">Go back home</Link>
    </section>
  );
}
