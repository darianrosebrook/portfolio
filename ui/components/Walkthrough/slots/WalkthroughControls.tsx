/** Controls slot for Walkthrough */
'use client';
import * as React from 'react';
import { useWalkthrough } from '../WalkthroughProvider';
import styles from '../Walkthrough.module.scss';

export interface WalkthroughControlsProps {
  onNext?: () => void;
  onPrev?: () => void;
  onSkip?: () => void;
  className?: string;
}

export const WalkthroughControls: React.FC<WalkthroughControlsProps> = ({
  onNext,
  onPrev,
  onSkip,
  className,
}) => {
  const { index, count, next, prev, cancel } = useWalkthrough();

  const handleNext = React.useCallback(() => {
    onNext?.() ?? next();
  }, [onNext, next]);

  const handlePrev = React.useCallback(() => {
    onPrev?.() ?? prev();
  }, [onPrev, prev]);

  const handleSkip = React.useCallback(() => {
    onSkip?.() ?? cancel();
  }, [onSkip, cancel]);

  return (
    <div className={[styles.controls, className].filter(Boolean).join(' ')}>
      <button type="button" onClick={handleSkip} className={styles.skip}>
        Skip
      </button>
      <button
        type="button"
        onClick={handlePrev}
        disabled={index === 0}
        className={styles.prev}
      >
        Back
      </button>
      <button type="button" onClick={handleNext} className={styles.next}>
        {index === count - 1 ? 'Done' : 'Next'}
      </button>
    </div>
  );
};
