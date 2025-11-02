'use client';

import React from 'react';
import Link from 'next/link';
import type { TrackId } from '@/types/tracks';
import { getFoundationPageBySlug } from '../_lib/pageRegistry';
import styles from './LearningPath.module.scss';

interface LearningPathProps {
  track: TrackId;
  learningPath: string[];
  completedPages: string[];
}

export function LearningPath({
  track,
  learningPath,
  completedPages,
}: LearningPathProps) {
  return (
    <div className={styles.learningPath}>
      <ol className={styles.pathList}>
        {learningPath.map((slug, index) => {
          const page = getFoundationPageBySlug(slug);
          const isCompleted = completedPages.includes(slug);
          const isCurrent = index === completedPages.length;

          if (!page) return null;

          return (
            <li
              key={slug}
              className={`${styles.pathItem} ${
                isCompleted ? styles.completed : ''
              } ${isCurrent ? styles.current : ''}`}
            >
              <div className={styles.pathStep}>
                <div className={styles.stepNumber}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className={styles.stepContent}>
                  <Link
                    href={`/blueprints/foundations/${page.path}`}
                    className={styles.stepLink}
                  >
                    {page.title}
                  </Link>
                  <span className={styles.stepDescription}>
                    {index === 0 && 'Start here'}
                    {index === learningPath.length - 1 && 'Final step'}
                    {index > 0 &&
                      index < learningPath.length - 1 &&
                      'Continue learning'}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
