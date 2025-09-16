/**
 * Walkthrough (Composer)
 * Visual scaffolding & Popover composition for coachmarks/feature tours
 */
'use client';
import * as React from 'react';
import { useWalkthrough } from './WalkthroughProvider';
import { WalkthroughControls } from './slots/WalkthroughControls';
import { WalkthroughProgress } from './slots/WalkthroughProgress';
import type { WalkthroughUIProps } from './types';
import styles from './Walkthrough.module.scss';
import Popover from '../Popover';

export const Walkthrough: React.FC<WalkthroughUIProps> = ({
  className,
  children,
  onMissingTarget = 'skip',
}) => {
  const { steps, index, anchorEl, open, cancel, closeOnOutsideClick } =
    useWalkthrough();
  const { next, prev } = useWalkthrough();

  const step = steps[index];

  type PopPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';
  const normalizePlacement = (p?: string): PopPlacement =>
    p === 'top' ||
    p === 'bottom' ||
    p === 'left' ||
    p === 'right' ||
    p === 'auto'
      ? p
      : 'auto';
  const popPlacement = normalizePlacement(
    step?.placement as string | undefined
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      cancel();
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      next();
      return;
    }
    if (e.key === 'ArrowLeft') {
      prev();
      return;
    }
    if (e.key === 'ArrowRight') {
      next();
      return;
    }
  };

  // Target missing policy
  const anchor = anchorEl ?? null;
  const shouldHide = !step || (!anchor && onMissingTarget === 'hide');
  const pinToCenter = !anchor && onMissingTarget === 'pin-to-center';

  if (!open || shouldHide) return null;

  // For missing targets that should be pinned to center
  if (pinToCenter) {
    return (
      <Popover
        open
        anchor={typeof document !== 'undefined' ? document.body : null}
        onOpenChange={(o) => {
          if (!o) cancel();
        }}
        placement={popPlacement}
        offset={step?.offset ?? 12}
        closeOnOutsideClick={closeOnOutsideClick ?? true}
      >
        <Popover.Content>
          <div
            className={[styles.content, className].filter(Boolean).join(' ')}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
          >
            {children ?? (
              <>
                {step?.title && (
                  <div className={styles.title}>{step.title}</div>
                )}
                {step?.description && (
                  <div className={styles.description}>{step.description}</div>
                )}
                <WalkthroughProgress />
                <WalkthroughControls />
              </>
            )}
          </div>
        </Popover.Content>
      </Popover>
    );
  }

  // For anchored targets, render positioned content
  if (!anchor) return null;

  return (
    <Popover
      open
      anchor={anchor}
      onOpenChange={(o) => {
        if (!o) cancel();
      }}
      placement={popPlacement}
      offset={step?.offset ?? 12}
      closeOnOutsideClick={closeOnOutsideClick ?? true}
    >
      <Popover.Content>
        <div
          className={[styles.content, className].filter(Boolean).join(' ')}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {children ?? (
            <>
              {step?.title && <div className={styles.title}>{step.title}</div>}
              {step?.description && (
                <div className={styles.description}>{step.description}</div>
              )}
              <WalkthroughProgress />
              <WalkthroughControls />
            </>
          )}
        </div>
      </Popover.Content>
    </Popover>
  );
};

Walkthrough.displayName = 'Walkthrough';

export default Walkthrough;
