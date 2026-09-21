import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { StatusPill, type StatusPillStatus } from './StatusPill';
import styles from './ContentCard.module.css';

export interface ContentCardProps {
  href: string;
  title: string;
  description?: string | null;
  status: StatusPillStatus;
  changes?: boolean;
  /** 'Article' | 'Case study' — shown as the leading meta label. */
  kind?: string;
  section?: string | null;
  image?: string | null;
  date?: string | null;
  wordCount?: number | null;
  /** Edit href shown as an index link in the meta line. */
  actions?: ReactNode;
}

/**
 * Deterministic cover fallback. Most rows have no cover image, so the fallback
 * is the common case and has to look deliberate rather than broken: the title's
 * initials on a section-keyed tile.
 */
function initials(title: string): string {
  const words = title.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word));
  if (words.length === 0) return '··';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/**
 * One card for library content, used by both the articles and case-studies
 * lists. It replaces two bespoke card implementations, four hand-copied SVG
 * icons per card, and the inline styles they carried.
 */
export function ContentCard({
  href,
  title,
  description,
  status,
  changes = false,
  kind,
  section,
  image,
  date,
  wordCount,
  actions,
}: ContentCardProps) {
  return (
    <article className={styles.card}>
      <Link
        href={href}
        className={styles.cover}
        aria-hidden="true"
        tabIndex={-1}
      >
        {image ? (
          <img src={image} alt="" loading="lazy" className={styles.image} />
        ) : (
          <span className={styles.fallback} data-section={section ?? 'none'}>
            {initials(title)}
          </span>
        )}
      </Link>

      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.title}>
            <Link href={href}>{title}</Link>
          </h3>
          <StatusPill status={status} changes={changes} />
        </div>

        {description && <p className={styles.description}>{description}</p>}

        <p className={styles.meta}>
          {kind && <span className={styles.kind}>{kind}</span>}
          {section && <span>{section}</span>}
          {date && (
            <span className={styles.metaItem}>
              <Icon name="clock" size={14} />
              {date}
            </span>
          )}
          {typeof wordCount === 'number' && wordCount > 0 && (
            <span className={styles.metaItem}>
              <Icon name="wordcount" size={14} />
              {wordCount.toLocaleString()} words
            </span>
          )}
        </p>
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </article>
  );
}
