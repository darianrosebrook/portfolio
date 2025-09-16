'use client';
import * as React from 'react';
import styles from './Spinner.module.scss';

export type SpinnerVariant = 'ring' | 'dots' | 'bars';

export interface SpinnerProps {
  /** Size token key or explicit px (e.g., 16). Default: 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
  /** Stroke thickness token or px. Default: 'regular' */
  thickness?: 'hairline' | 'regular' | 'bold' | number;
  /** Visual variant */
  variant?: SpinnerVariant;
  /** If decorative only, set ariaHidden; else provide label */
  ariaHidden?: boolean;
  /** Localized label for SR users; ignored if ariaHidden */
  label?: string;
  /** Inline layout (align with baseline) */
  inline?: boolean;
  /** Delay before showing (ms) to avoid spinner flash */
  showAfterMs?: number;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  thickness = 'regular',
  variant = 'ring',
  ariaHidden,
  label = 'Loading',
  inline = false,
  showAfterMs = 150,
  className,
}) => {
  const [visible, setVisible] = React.useState(showAfterMs === 0);

  React.useEffect(() => {
    if (showAfterMs === 0) return;
    const t = setTimeout(() => setVisible(true), showAfterMs);
    return () => clearTimeout(t);
  }, [showAfterMs]);

  const styleVars = React.useMemo(() => {
    const resolvedSize =
      typeof size === 'number' ? `${size}px` : `var(--spinner-size-${size})`;
    const resolvedThickness =
      typeof thickness === 'number'
        ? `${thickness}px`
        : `var(--spinner-thickness-${thickness})`;
    return {
      ['--spinner-size-value' as any]: resolvedSize,
      ['--spinner-thickness-value' as any]: resolvedThickness,
    } as React.CSSProperties;
  }, [size, thickness]);

  if (!visible) return null;

  const a11yProps = ariaHidden
    ? { 'aria-hidden': true as const }
    : ({ role: 'status', 'aria-live': 'polite', 'aria-label': label } as const);

  const rootClassName = [
    styles.root,
    inline ? styles.inline : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={rootClassName}
      style={styleVars}
      data-variant={variant}
      {...a11yProps}
    >
      <span className={styles.visual} />
    </span>
  );
};

Spinner.displayName = 'Spinner';
export default Spinner;
