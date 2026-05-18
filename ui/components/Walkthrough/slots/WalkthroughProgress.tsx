/** Progress slot for Walkthrough */
'use client';
import * as React from 'react';
import { useWalkthrough } from '../WalkthroughProvider';
import '../Walkthrough.css';

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
        className={['dots', className].filter(Boolean).join(' ')}
        data-slot="walkthrough-progress"
        role="status"
        aria-live="polite"
        aria-label={`Step ${index + 1} of ${count}`}
      >
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            data-slot="walkthrough-dot"
            className={i === index ? 'dotActive' : 'dot'}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={['counter', className].filter(Boolean).join(' ')}
      data-slot="walkthrough-counter"
      aria-live="polite"
    >
      {index + 1} / {count}
    </div>
  );
};
