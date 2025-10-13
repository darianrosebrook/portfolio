import React, { useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
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
    } as any);
  }
  return null;
});

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
    const chipRef = useRef<HTMLButtonElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);

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

    // GSAP animation for icon entrance
    useEffect(() => {
      if (
        iconRef.current &&
        (variant === 'selected' || variant === 'dismissible')
      ) {
        const tl = gsap.timeline();
        tl.fromTo(
          iconRef.current,
          {
            scale: 0.8,
            opacity: 0,
          },
          {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            ease: 'back.out(1.7)',
          }
        );

        return () => {
          tl.kill();
        };
      }
    }, [variant]);

    // Handle hover animations with GSAP
    useEffect(() => {
      const chipElement = chipRef.current;
      if (!chipElement || disabled) return;

      const handleMouseEnter = () => {
        gsap.to(chipElement, {
          scale: 1.02,
          duration: 0.2,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(chipElement, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        });
      };

      chipElement.addEventListener('mouseenter', handleMouseEnter);
      chipElement.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        chipElement.removeEventListener('mouseenter', handleMouseEnter);
        chipElement.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, [disabled]);

    const renderIcon = () => {
      if (variant === 'selected') {
        return (
          <div ref={iconRef} className={styles.icon} aria-hidden="true">
            <CheckIcon />
          </div>
        );
      }

      if (variant === 'dismissible') {
        return (
          <div ref={iconRef} className={styles.icon} aria-hidden="true">
            <XIcon />
          </div>
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
        ref={(node) => {
          chipRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
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
