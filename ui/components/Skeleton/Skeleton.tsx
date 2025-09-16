'use client';
import * as React from 'react';
import styles from './Skeleton.module.scss';
import { SkeletonShape } from './SkeletonShape';

export type SkeletonVariant =
  | 'block'
  | 'text'
  | 'avatar'
  | 'media'
  | 'dataviz'
  | 'actions';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  animate?: 'shimmer' | 'wipe' | 'pulse' | 'none';
  density?: 'compact' | 'regular' | 'spacious';
  aspectRatio?: string;
  lines?: number | { min: number; max: number };
  radius?: 'sm' | 'md' | 'lg';
  decorative?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'block',
  animate = 'shimmer',
  density = 'regular',
  aspectRatio,
  lines = { min: 2, max: 3 },
  radius,
  decorative = true,
  children,
  className,
}) => {
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : ({
        role: 'status',
        'aria-live': 'polite',
        'aria-label': 'Loading…',
      } as const);

  const attrs = {
    className: [styles.root, className || ''].filter(Boolean).join(' '),
    'data-animate': animate as string,
    'data-density': density as string,
    'data-variant': variant as string,
  };

  const content = React.useMemo(() => {
    if (children) return children;

    switch (variant) {
      case 'text': {
        const [min, max] =
          typeof lines === 'number' ? [lines, lines] : [lines.min, lines.max];
        const count = Math.max(min, max);
        return (
          <div className={styles.stack}>
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonShape
                key={i}
                kind="line"
                width={i === count - 1 ? '60%' : '100%'}
                height="1em"
                radius={radius ?? 'md'}
                delayMs={i * 60}
              />
            ))}
          </div>
        );
      }
      case 'avatar': {
        return (
          <div className={styles.row}>
            <SkeletonShape
              kind="circle"
              width={40}
              height={40}
              radius={radius ?? 'lg'}
            />
            <div className={styles.stack}>
              <SkeletonShape kind="line" width="80%" height="1em" />
              <SkeletonShape
                kind="line"
                width="60%"
                height="1em"
                delayMs={80}
              />
            </div>
          </div>
        );
      }
      case 'actions': {
        return (
          <div className={styles.row} style={{ gap: 'var(--skeleton-gap-md)' }}>
            <SkeletonShape
              kind="rect"
              width={96}
              height={36}
              radius={radius ?? 'lg'}
            />
            <SkeletonShape
              kind="rect"
              width={120}
              height={36}
              radius={radius ?? 'lg'}
              delayMs={80}
            />
          </div>
        );
      }
      case 'media': {
        return (
          <div
            className={styles.media}
            style={{ aspectRatio: aspectRatio ?? '16/9' }}
          >
            <SkeletonShape
              kind="rect"
              width="100%"
              height="100%"
              radius={radius ?? 'lg'}
            />
          </div>
        );
      }
      case 'dataviz': {
        return (
          <div className={styles.stack}>
            <SkeletonShape kind="line" width="40%" height="1.1em" />
            <div
              className={styles.media}
              style={{ aspectRatio: aspectRatio ?? '16/9' }}
            >
              <SkeletonShape
                kind="rect"
                width="100%"
                height="100%"
                radius={radius ?? 'md'}
              />
            </div>
            <div className={styles.row}>
              <SkeletonShape
                kind="line"
                width="30%"
                height="0.9em"
                delayMs={60}
              />
              <SkeletonShape
                kind="line"
                width="30%"
                height="0.9em"
                delayMs={120}
              />
              <SkeletonShape
                kind="line"
                width="30%"
                height="0.9em"
                delayMs={180}
              />
            </div>
          </div>
        );
      }
      default: {
        return (
          <SkeletonShape
            kind="rect"
            width="100%"
            height="100%"
            radius={radius ?? 'md'}
          />
        );
      }
    }
  }, [variant, aspectRatio, lines, radius, children]);

  return (
    <div {...a11y} {...attrs}>
      {content}
    </div>
  );
};

Skeleton.displayName = 'Skeleton';
export default Skeleton;
