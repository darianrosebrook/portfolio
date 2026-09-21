import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconGlyph } from './Icon';
import styles from './IconButton.module.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconGlyph;
  /** Accessible name; also used as the native tooltip. */
  label: string;
  variant?: 'default' | 'danger';
}

export function IconButton({
  icon,
  label,
  variant = 'default',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={[styles.button, className].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
      data-variant={variant}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}
