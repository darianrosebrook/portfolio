'use client';

import type { ComponentReference } from '@/types/foundationContent';
import Link from 'next/link';
import React from 'react';
import styles from './ComponentReference.module.scss';

interface ComponentReferenceProps {
  reference: ComponentReference;
}

export function ComponentReference({ reference }: ComponentReferenceProps) {
  return (
    <div className={styles.reference}>
      <Link
        href={`/blueprints/component-standards/${reference.slug}`}
        className={styles.link}
      >
        <span className={styles.componentName}>{reference.component}</span>
        <span className={styles.description}>{reference.description}</span>
      </Link>
      {reference.relatedConcepts && reference.relatedConcepts.length > 0 && (
        <div className={styles.relatedConcepts}>
          <span className={styles.relatedLabel}>Related:</span>
          {reference.relatedConcepts.map((concept, idx) => (
            <React.Fragment key={idx}>
              <Link
                href={`/blueprints/foundations/${concept}`}
                className={styles.relatedLink}
              >
                {concept}
              </Link>
              {idx < reference.relatedConcepts!.length - 1 && ', '}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
