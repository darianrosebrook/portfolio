'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <section className="content">
          <h2>Having some trouble loading this content...</h2>
          <p>A critical error interrupted the page. Please try again.</p>
          {error.digest ? (
            <p>
              Reference: <code>{error.digest}</code>
            </p>
          ) : null}
          <button type="button" onClick={() => reset()}>
            Try again
          </button>
          <a href="/">Go back home</a>
        </section>
      </body>
    </html>
  );
}
