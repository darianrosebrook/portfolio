'use client';

import * as React from 'react';
import { useRef, useEffect, Children, cloneElement, isValidElement } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/context/ReducedMotionContext';
import {
  EDITORIAL_STAGGER,
  EASING_PRESETS,
  ANIMATION_DURATIONS,
} from '@/utils/animation';
import styles from './AnimatedSection.module.scss';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface AnimatedSectionProps {
  /** Children to animate */
  children: React.ReactNode;
  /** Element type to render */
  as?: 'section' | 'div' | 'article' | 'main' | 'aside' | 'header' | 'footer';
  /** Animation variant */
  variant?: 'fade-up' | 'fade-in' | 'slide-in' | 'stagger-children';
  /** Duration of animation in seconds */
  duration?: number;
  /** Stagger delay between children in seconds (for stagger-children variant) */
  stagger?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Whether to trigger on scroll into view */
  triggerOnScroll?: boolean;
  /** ScrollTrigger start position */
  scrollStart?: string;
  /** Additional class name */
  className?: string;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

/**
 * AnimatedSection Component
 *
 * A wrapper component that animates its content on scroll into view.
 * Supports staggered children animations for editorial-style reveals.
 *
 * Features:
 * - Multiple animation variants
 * - Staggered children animation
 * - Respects reduced motion preferences
 * - Scroll-triggered or immediate animation
 */
export const AnimatedSection = React.forwardRef<
  HTMLElement,
  AnimatedSectionProps
>(
  (
    {
      children,
      as: Component = 'section',
      variant = 'fade-up',
      duration = ANIMATION_DURATIONS.slow,
      stagger = EDITORIAL_STAGGER.sections,
      delay = 0,
      triggerOnScroll = true,
      scrollStart = 'top 80%',
      className = '',
      onAnimationComplete,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLElement>(null);
    const childrenRef = useRef<HTMLElement[]>([]);
    const { prefersReducedMotion } = useReducedMotion();

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Skip animation if reduced motion is preferred
      if (prefersReducedMotion) {
        if (variant === 'stagger-children') {
          childrenRef.current.forEach((child) => {
            if (child) {
              gsap.set(child, { opacity: 1, y: 0, x: 0 });
            }
          });
        } else {
          gsap.set(container, { opacity: 1, y: 0, x: 0 });
        }
        return;
      }

      const ctx = gsap.context(() => {
        // Initial states based on variant
        const initialStates = {
          'fade-up': { opacity: 0, y: 30 },
          'fade-in': { opacity: 0 },
          'slide-in': { opacity: 0, x: -30 },
          'stagger-children': { opacity: 0, y: 30 },
        };

        // Animation configurations
        const animationConfigs = {
          'fade-up': {
            opacity: 1,
            y: 0,
            duration,
            ease: EASING_PRESETS.smooth,
            delay,
            onComplete: onAnimationComplete,
          },
          'fade-in': {
            opacity: 1,
            duration,
            ease: EASING_PRESETS.smooth,
            delay,
            onComplete: onAnimationComplete,
          },
          'slide-in': {
            opacity: 1,
            x: 0,
            duration,
            ease: EASING_PRESETS.smooth,
            delay,
            onComplete: onAnimationComplete,
          },
          'stagger-children': {
            opacity: 1,
            y: 0,
            duration,
            ease: EASING_PRESETS.smooth,
            stagger,
            delay,
            onComplete: onAnimationComplete,
          },
        };

        const initialState = initialStates[variant];
        const config = animationConfigs[variant];

        if (variant === 'stagger-children') {
          // Animate children with stagger
          const validChildren = childrenRef.current.filter(Boolean);
          if (validChildren.length === 0) return;

          gsap.set(validChildren, initialState);

          if (triggerOnScroll) {
            gsap.to(validChildren, {
              ...config,
              scrollTrigger: {
                trigger: container,
                start: scrollStart,
                once: true,
              },
            });
          } else {
            gsap.to(validChildren, config);
          }
        } else {
          // Animate container as a whole
          gsap.set(container, initialState);

          if (triggerOnScroll) {
            gsap.to(container, {
              ...config,
              scrollTrigger: {
                trigger: container,
                start: scrollStart,
                once: true,
              },
            });
          } else {
            gsap.to(container, config);
          }
        }
      }, containerRef);

      return () => ctx.revert();
    }, [
      variant,
      duration,
      stagger,
      delay,
      triggerOnScroll,
      scrollStart,
      prefersReducedMotion,
      onAnimationComplete,
    ]);

    // Combine refs
    const setRefs = (el: HTMLElement | null) => {
      containerRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
    };

    // Process children for stagger-children variant
    const processedChildren =
      variant === 'stagger-children'
        ? Children.map(children, (child, index) => {
            if (isValidElement(child)) {
              const childProps = child.props as Record<string, unknown>;
              return cloneElement(
                child as React.ReactElement<{
                  ref?: React.Ref<HTMLElement>;
                  className?: string;
                  style?: React.CSSProperties;
                }>,
                {
                  ref: (el: HTMLElement | null) => {
                    if (el) childrenRef.current[index] = el;
                  },
                  className: [childProps.className, styles.animatedChild]
                    .filter(Boolean)
                    .join(' '),
                  style: {
                    ...(childProps.style as React.CSSProperties | undefined),
                    // Set initial state for SSR/hydration
                    opacity: prefersReducedMotion ? 1 : 0,
                  },
                }
              );
            }
            return child;
          })
        : children;

    return React.createElement(
      Component,
      {
        ref: setRefs,
        className: [styles.animatedSection, className].filter(Boolean).join(' '),
        style: {
          // Set initial state for SSR/hydration (non-stagger variants)
          opacity:
            variant !== 'stagger-children' && !prefersReducedMotion ? 0 : 1,
        },
      },
      processedChildren
    );
  }
);

AnimatedSection.displayName = 'AnimatedSection';
export default AnimatedSection;
