'use client';
import * as React from 'react';
import { createCSSProperties } from '@/utils/css-custom-properties';
import styles from './Skeleton.module.scss';

export interface SkeletonShapeProps {
  kind?: 'rect' | 'circle' | 'line';
  width?: number | string;
  height?: number | string;
  radius?: 'sm' | 'md' | 'lg';
  delayMs?: number;
  className?: string;
}

export const SkeletonShape: React.FC<SkeletonShapeProps> = ({
  kind = 'rect',
  width = '100%',
  height,
  radius,
  delayMs = 0,
  className,
}) => {
  const style: React.CSSProperties = {
    ...createCSSProperties({
      '--skeleton-wipe-delay': `${delayMs}ms`,
      '--skeleton-radius-override': radius
        ? `var(--skeleton-radius-${radius})`
        : undefined,
    }),
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <span
      className={[
        styles.shape,
        styles[`kind-${kind}` as 'kind-rect'],
        className || '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      aria-hidden="true"
    />
  );
};

SkeletonShape.displayName = 'SkeletonShape';

export default SkeletonShape;
