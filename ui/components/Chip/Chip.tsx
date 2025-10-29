/**
 * Chip (Primitive)
 *
 * A simple chip component for tags, filters, or labels.
 * Supports hover animations with GSAP and follows design system conventions.
 */
'use client';
import { gsap } from 'gsap';
import React, { forwardRef, useCallback, useLayoutEffect, useRef } from 'react';
import styles from './Chip.module.scss';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the chip is clickable
   */
  clickable?: boolean;
  /**
   * Chip size variant
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Chip variant for different visual styles
   */
  variant?: 'default' | 'filled' | 'outlined';
}

export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      className = '',
      clickable = false,
      size = 'medium',
      variant = 'default',
      children,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const chipRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<gsap.core.Tween | null>(null);
    const isHoveringRef = useRef(false);
    const isFocusedRef = useRef(false);

    // Combine refs
    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        chipRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // GSAP hover animation
    const handleHover = useCallback(
      (isHover: boolean) => {
        if (!chipRef.current || !clickable) return;

        isHoveringRef.current = isHover;

        if (animationRef.current) {
          animationRef.current.kill();
        }

        const targetY = isHover ? -2 : 0;
        const targetShadow = isHover
          ? 'var(--semantic-elevation-depth-2)'
          : 'var(--chip-elevation-default)';

        animationRef.current = gsap.to(chipRef.current, {
          duration: 0.15,
          y: targetY,
          ease: 'power2.out',
          onUpdate: () => {
            // Update box-shadow during animation
            if (chipRef.current) {
              chipRef.current.style.boxShadow = `${targetShadow} var(--semantic-color-background-imageOverlay)`;
            }
          },
        });
      },
      [clickable]
    );

    // Handle mouse events
    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        onMouseEnter?.(e);
        handleHover(true);
      },
      [onMouseEnter, handleHover]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        onMouseLeave?.(e);
        handleHover(false);
      },
      [onMouseLeave, handleHover]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        onFocus?.(e);
        isFocusedRef.current = true;
        if (clickable) {
          handleHover(true);
        }
      },
      [onFocus, clickable, handleHover]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        onBlur?.(e);
        isFocusedRef.current = false;
        if (clickable && !isHoveringRef.current) {
          handleHover(false);
        }
      },
      [onBlur, clickable, handleHover]
    );

    // Cleanup animations on unmount
    useLayoutEffect(() => {
      return () => {
        if (animationRef.current) {
          animationRef.current.kill();
        }
      };
    }, []);

    const baseClassName = styles.chip;
    const clickableClassName = clickable ? styles.clickable : '';
    const sizeClassName = styles[size];
    const variantClassName = styles[variant];

    const combinedClassName = [
      baseClassName,
      clickableClassName,
      sizeClassName,
      variantClassName,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={setRefs}
        className={combinedClassName}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? 'button' : 'generic'}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Chip.displayName = 'Chip';

export default React.memo(Chip);
