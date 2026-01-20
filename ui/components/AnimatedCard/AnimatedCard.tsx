'use client';

import * as React from 'react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/context/ReducedMotionContext';
import {
  EDITORIAL_STAGGER,
  EASING_PRESETS,
  ANIMATION_DURATIONS,
} from '@/utils/animation';
import styles from './AnimatedCard.module.scss';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface AnimatedCardProps {
  /** Children to render inside the card */
  children: React.ReactNode;
  /** Element type to render */
  as?: 'article' | 'div' | 'li' | 'a';
  /** Duration of entry animation in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Whether to trigger on scroll into view */
  triggerOnScroll?: boolean;
  /** ScrollTrigger start position */
  scrollStart?: string;
  /** Enable hover effects */
  enableHover?: boolean;
  /** Additional class name */
  className?: string;
  /** Card href (if as="a") */
  href?: string;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Click handler */
  onClick?: () => void;
}

/**
 * AnimatedCard Component
 *
 * A card component with GSAP entry animation and CSS hover effects.
 * Designed for article cards, project cards, and similar content.
 *
 * Features:
 * - GSAP entry animation (fade up)
 * - CSS hover effects (uses group pattern for child animations)
 * - Image zoom on hover
 * - Title color transition on hover
 * - Respects reduced motion preferences
 */
export const AnimatedCard = React.forwardRef<HTMLElement, AnimatedCardProps>(
  (
    {
      children,
      as: Component = 'article',
      duration = ANIMATION_DURATIONS.slow,
      delay = 0,
      triggerOnScroll = true,
      scrollStart = 'top 85%',
      enableHover = true,
      className = '',
      href,
      onAnimationComplete,
      onClick,
      ...rest
    },
    ref
  ) => {
    const cardRef = useRef<HTMLElement>(null);
    const { prefersReducedMotion } = useReducedMotion();

    useEffect(() => {
      const card = cardRef.current;
      if (!card) return;

      // Skip animation if reduced motion is preferred
      if (prefersReducedMotion) {
        gsap.set(card, { opacity: 1, y: 0 });
        return;
      }

      const ctx = gsap.context(() => {
        // Set initial state
        gsap.set(card, { opacity: 0, y: 20 });

        const config = {
          opacity: 1,
          y: 0,
          duration,
          ease: EASING_PRESETS.smooth,
          delay,
          onComplete: onAnimationComplete,
        };

        if (triggerOnScroll) {
          gsap.to(card, {
            ...config,
            scrollTrigger: {
              trigger: card,
              start: scrollStart,
              once: true,
            },
          });
        } else {
          gsap.to(card, config);
        }
      }, cardRef);

      return () => ctx.revert();
    }, [
      duration,
      delay,
      triggerOnScroll,
      scrollStart,
      prefersReducedMotion,
      onAnimationComplete,
    ]);

    // Combine refs
    const setRefs = (el: HTMLElement | null) => {
      cardRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
    };

    const cardClasses = [
      styles.animatedCard,
      enableHover ? styles.hoverable : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const props = {
      ref: setRefs,
      className: cardClasses,
      style: {
        // Set initial state for SSR/hydration
        opacity: prefersReducedMotion ? 1 : 0,
      },
      onClick,
      ...(Component === 'a' ? { href } : {}),
      ...rest,
    };

    return React.createElement(Component, props, children);
  }
);

AnimatedCard.displayName = 'AnimatedCard';

/**
 * AnimatedCardImage Component
 *
 * Image wrapper that applies zoom effect on parent card hover.
 */
export interface AnimatedCardImageProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedCardImage: React.FC<AnimatedCardImageProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={[styles.cardImageWrapper, className].filter(Boolean).join(' ')}
    >
      <div className={styles.cardImage}>{children}</div>
    </div>
  );
};

AnimatedCardImage.displayName = 'AnimatedCardImage';

/**
 * AnimatedCardTitle Component
 *
 * Title that changes color on parent card hover.
 */
export interface AnimatedCardTitleProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
}

export const AnimatedCardTitle: React.FC<AnimatedCardTitleProps> = ({
  children,
  as: Component = 'h4',
  className = '',
}) => {
  return React.createElement(
    Component,
    {
      className: [styles.cardTitle, className].filter(Boolean).join(' '),
    },
    children
  );
};

AnimatedCardTitle.displayName = 'AnimatedCardTitle';

/**
 * AnimatedCardOverlay Component
 *
 * Optional overlay that fades in on parent card hover.
 */
export interface AnimatedCardOverlayProps {
  children?: React.ReactNode;
  className?: string;
}

export const AnimatedCardOverlay: React.FC<AnimatedCardOverlayProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={[styles.cardOverlay, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
};

AnimatedCardOverlay.displayName = 'AnimatedCardOverlay';

export default AnimatedCard;
