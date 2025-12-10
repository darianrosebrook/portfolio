'use client';
import React, { useMemo } from 'react';
import styles from './Chip.module.scss';

// Simple Slot implementation to avoid Radix dependency
const Slot = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { children: React.ReactElement }
>(({ children, ...props }, ref) => {
  if (React.isValidElement(children)) {
    const childProps = children.props as Record<string, unknown>;
    return React.cloneElement(children, {
      ...childProps,
      ...props,
      ref,
      className: [props.className, childProps.className]
        .filter(Boolean)
        .join(' '),
    } as React.HTMLAttributes<HTMLElement>);
  }
  return null;
});
Slot.displayName = 'Slot';

export type ChipVariant = 'default' | 'selected' | 'dismissible';
export type ChipSize = 'small' | 'medium' | 'large';

interface ChipBaseProps {
  variant?: ChipVariant;
  size?: ChipSize;
  disabled?: boolean;
  className?: string;
  title?: string;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  role?: React.AriaRole;
  asChild?: boolean;
  children: React.ReactNode;
}

interface ChipAsButton
  extends ChipBaseProps,
    Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'className' | 'type' | 'onClick' | 'disabled' | 'children'
    > {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  autoFocus?: boolean;
  tabIndex?: number;
  'data-testid'?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface ChipAsAnchor
  extends ChipBaseProps,
    Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'className' | 'href' | 'onClick' | 'children'
    > {
  as: 'a';
  href: string;
  tabIndex?: number;
  'data-testid'?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export type ChipProps = ChipAsButton | ChipAsAnchor;

// Check icon component (inline SVG)
const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

// X icon component (inline SVG)
const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      as = 'button',
      variant = 'default',
      size = 'medium',
      disabled = false,
      className = '',
      title = '',
      ariaLabel,
      ariaExpanded,
      ariaPressed,
      role,
      asChild = false,
      children,
      ...rest
    },
    ref
  ) => {
    const baseClassName = styles.chip;
    const variantClassName = styles[variant];
    const sizeClassName = styles[size];
    const isDisabledClassName = disabled ? styles.disabled : '';

    const combinedClassName = useMemo(
      () =>
        [
          baseClassName,
          variantClassName,
          sizeClassName,
          isDisabledClassName,
          className,
        ]
          .filter(Boolean)
          .join(' '),
      [
        baseClassName,
        variantClassName,
        sizeClassName,
        isDisabledClassName,
        className,
      ]
    );

    const renderIcon = () => {
      if (variant === 'selected') {
        return (
          <span className={styles.icon} aria-hidden="true">
            <CheckIcon />
          </span>
        );
      }

      if (variant === 'dismissible') {
        return (
          <span className={styles.icon} aria-hidden="true">
            <XIcon />
          </span>
        );
      }

      return null;
    };

    const renderChildren = () => {
      if (children == null) return null;

      if (typeof children === 'string' || typeof children === 'number') {
        const stringValue = String(children);
        if (stringValue.trim() === '') return null;

        return (
          <>
            <span className={styles.text}>{children}</span>
            {renderIcon()}
          </>
        );
      }

      return (
        <>
          {children}
          {renderIcon()}
        </>
      );
    };

    const ariaProps = {
      ...(ariaLabel && { 'aria-label': ariaLabel }),
      ...(ariaExpanded !== undefined && { 'aria-expanded': ariaExpanded }),
      ...(ariaPressed !== undefined && { 'aria-pressed': ariaPressed }),
      ...(role && { role }),
    } as const;

    // Handle asChild pattern
    if (asChild) {
      return (
        <Slot
          className={combinedClassName}
          title={title}
          {...ariaProps}
          data-slot="chip"
        >
          {children as React.ReactElement}
        </Slot>
      );
    }

    if (as === 'a') {
      const { href, ...anchorRest } = rest as ChipAsAnchor;
      return (
        <a
          href={href}
          className={combinedClassName}
          title={title}
          {...ariaProps}
          {...anchorRest}
          data-slot="chip"
          data-variant={variant}
          data-size={size}
        >
          {renderChildren()}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled}
        title={title}
        {...(rest as ChipAsButton)}
        {...ariaProps}
        data-slot="chip"
        data-variant={variant}
        data-size={size}
      >
        {renderChildren()}
      </button>
    );
  }
);

Chip.displayName = 'Chip';

export { Chip };
export default React.memo(Chip);
