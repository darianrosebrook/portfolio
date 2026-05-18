/** Controls slot for Walkthrough */
'use client';
import * as React from 'react';
import { useWalkthrough } from '../WalkthroughProvider';
import '../Walkthrough.css';

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
    <div
      data-slot="walkthrough-controls"
      className={['controls', className].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        onClick={handleSkip}
        data-slot="walkthrough-skip"
        className="skip"
      >
        Skip
      </button>
      <button
        type="button"
        onClick={handlePrev}
        disabled={index === 0}
        data-slot="walkthrough-prev"
        className="prev"
      >
        Back
      </button>
      <button
        type="button"
        onClick={handleNext}
        data-slot="walkthrough-next"
        className="next"
      >
        {index === count - 1 ? 'Done' : 'Next'}
      </button>
    </div>
  );
};
