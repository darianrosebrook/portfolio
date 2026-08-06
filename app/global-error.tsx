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
          {/*
            A plain anchor is deliberate. global-error replaces the root layout,
            so it renders when the app has crashed at the root and the Next.js
            client router may itself be dead. <Link> would depend on that router;
            a hard navigation forces a full document load and actually recovers.
          */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">Go back home</a>
        </section>
      </body>
    </html>
  );
}
