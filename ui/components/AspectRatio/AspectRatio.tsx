'use client';
import * as React from 'react';
import styles from './AspectRatio.module.scss';

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Aspect ratio as width/height (e.g., 16/9, 4/3, 1) */
  ratio?: number;
  /** Predefined aspect ratio */
  preset?: 'square' | 'video' | 'photo' | 'wide' | 'portrait';
}

const PRESET_RATIOS = {
  square: 1,
  video: 16 / 9,
  photo: 4 / 3,
  wide: 21 / 9,
  portrait: 3 / 4,
} as const;

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio, preset, className = '', style, children, ...rest }, ref) => {
    const aspectRatio = ratio ?? (preset ? PRESET_RATIOS[preset] : 1);

    const customStyle: React.CSSProperties = {
      ...style,
      aspectRatio: aspectRatio.toString(),
    };

    return (
      <div
        ref={ref}
        className={[styles.container, className].filter(Boolean).join(' ')}
        style={customStyle}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

AspectRatio.displayName = 'AspectRatio';
export default AspectRatio;
