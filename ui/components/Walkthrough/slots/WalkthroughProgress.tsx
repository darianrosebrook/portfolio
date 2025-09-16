/** Progress slot for Walkthrough */
'use client';
import * as React from 'react';
import { useWalkthrough } from '../WalkthroughProvider';
import styles from '../Walkthrough.module.scss';

export interface WalkthroughProgressProps {
  dots?: boolean;
  className?: string;
}

export const WalkthroughProgress: React.FC<WalkthroughProgressProps> = ({
  dots = true,
  className,
}) => {
  const { index, count } = useWalkthrough();

  if (dots) {
    return (
      <div
        className={[styles.dots, className].filter(Boolean).join(' ')}
        role="status"
        aria-live="polite"
        aria-label={`Step ${index + 1} of ${count}`}
      >
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={i === index ? styles.dotActive : styles.dot}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={[styles.counter, className].filter(Boolean).join(' ')}
      aria-live="polite"
    >
      {index + 1} / {count}
    </div>
  );
};
