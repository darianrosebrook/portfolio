'use client';
import * as React from 'react';
import './Skeleton.css';
import { SkeletonShape } from './SkeletonShape';

export type SkeletonVariant =
  | 'block'
  | 'text'
  | 'avatar'
  | 'media'
  | 'dataviz'
  | 'actions';

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: SkeletonVariant;
  animate?: 'shimmer' | 'wipe' | 'pulse' | 'none';
  density?: 'compact' | 'regular' | 'spacious';
  aspectRatio?: string;
  lines?: number | { min: number; max: number };
  radius?: 'sm' | 'md' | 'lg';
  /**
   * When true, the placeholder is hidden from assistive tech (aria-hidden).
   * Useful when wrapping multiple skeletons inside a single composer that
   * already announces loading state. Default: false (announce as status).
   */
  decorative?: boolean;
  /** Localized label for SR users when not decorative. Default: 'Loading…' */
  label?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'block',
  animate = 'shimmer',
  density = 'regular',
  aspectRatio,
  lines = { min: 2, max: 3 },
  radius,
  decorative = false,
  label = 'Loading…',
  children,
  className,
  ...rest
}) => {
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : ({
        role: 'status',
        'aria-live': 'polite',
        'aria-busy': true as const,
        'aria-label': label,
      } as const);

  const attrs = {
    className: ['skeleton', 'root', className || ''].filter(Boolean).join(' '),
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
          <div className="stack">
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
          <div className="row">
            <SkeletonShape
              kind="circle"
              width={40}
              height={40}
              radius={radius ?? 'lg'}
            />
            <div className="stack">
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
          <div className="row" style={{ gap: 'var(--skeleton-gap-md)' }}>
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
          <div className="media" style={{ aspectRatio: aspectRatio ?? '16/9' }}>
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
          <div className="stack">
            <SkeletonShape kind="line" width="40%" height="1.1em" />
            <div
              className="media"
              style={{ aspectRatio: aspectRatio ?? '16/9' }}
            >
              <SkeletonShape
                kind="rect"
                width="100%"
                height="100%"
                radius={radius ?? 'md'}
              />
            </div>
            <div className="row">
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
    <div
      data-ds-component="Skeleton"
      data-slot="skeleton"
      {...a11y}
      {...attrs}
      {...rest}
    >
      {content}
    </div>
  );
};

Skeleton.displayName = 'Skeleton';
export default Skeleton;
