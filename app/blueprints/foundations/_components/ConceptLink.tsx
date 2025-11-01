'use client';

import type { ConceptLink } from '@/types/foundationContent';
import Link from 'next/link';
import styles from './ConceptLink.module.scss';

interface ConceptLinkProps {
  concept: ConceptLink;
  variant?: 'inline' | 'card';
}

export function ConceptLinkComponent({
  concept,
  variant = 'inline',
}: ConceptLinkProps) {
  const href =
    concept.type === 'foundation'
      ? `/blueprints/foundations/${concept.slug}`
      : concept.type === 'component'
        ? `/blueprints/component-standards/${concept.slug}`
        : concept.type === 'pattern'
          ? `/blueprints/interaction-patterns/${concept.slug}`
          : `/blueprints/glossary#${concept.slug}`;

  if (variant === 'card') {
    return (
      <div className={styles.card}>
        <Link href={href} className={styles.cardLink}>
          <h3 className={styles.cardTitle}>{concept.title}</h3>
          {concept.description && (
            <p className={styles.cardDescription}>{concept.description}</p>
          )}
          <span className={styles.cardType}>{concept.type}</span>
        </Link>
      </div>
    );
  }

  return (
    <Link href={href} className={styles.inline}>
      {concept.title}
    </Link>
  );
}
