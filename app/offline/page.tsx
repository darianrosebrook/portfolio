'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function OfflinePage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>You&apos;re Offline</h1>
        <p>
          It looks like you&apos;ve lost your internet connection. Don&apos;t
          worry, you can still access some content that was previously cached.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            Try Homepage
          </Link>
          <button
            onClick={() => window.location.reload()}
            className={styles.button}
          >
            Retry Connection
          </button>
        </div>
        <div className={styles.cachedContent}>
          <h2>Available Offline</h2>
          <ul>
            <li>Homepage</li>
            <li>Profile images</li>
            <li>Fonts</li>
            <li>Basic styling</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
