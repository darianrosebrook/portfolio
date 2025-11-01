'use client';

import type { AuthorMetadata } from '@/types/foundationContent';
import Link from 'next/link';
import styles from './AuthorProfile.module.scss';

interface AuthorProfileProps {
  author: AuthorMetadata;
  publishedDate: string;
  modifiedDate?: string;
}

export function AuthorProfile({
  author,
  publishedDate,
  modifiedDate,
}: AuthorProfileProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.authorProfile}>
      <div className={styles.authorInfo}>
        {author.imageUrl && (
          <img
            src={author.imageUrl}
            alt={author.name}
            className={styles.avatar}
          />
        )}
        <div className={styles.authorDetails}>
          <div className={styles.authorName}>
            {author.profileUrl ? (
              <Link href={author.profileUrl} className={styles.authorLink}>
                {author.name}
              </Link>
            ) : (
              <span>{author.name}</span>
            )}
          </div>
          <div className={styles.authorRole}>{author.role}</div>
          {author.expertise.length > 0 && (
            <div className={styles.expertise}>
              <span className={styles.expertiseLabel}>Expertise:</span>
              <span className={styles.expertiseList}>
                {author.expertise.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.meta}>
        <time dateTime={publishedDate} className={styles.date}>
          Published {formatDate(publishedDate)}
        </time>
        {modifiedDate && modifiedDate !== publishedDate && (
          <time dateTime={modifiedDate} className={styles.date}>
            Updated {formatDate(modifiedDate)}
          </time>
        )}
      </div>
    </div>
  );
}
