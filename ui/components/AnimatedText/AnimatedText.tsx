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
import styles from './AnimatedText.module.scss';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface AnimatedTextProps {
  /** The text content to animate */
  text: string;
  /** Element type to render */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  /** Animation variant */
  variant?: 'blur-in' | 'fade-up' | 'slide-in';
  /** Duration of each word animation in seconds */
  duration?: number;
  /** Stagger delay between words in seconds */
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
 * AnimatedText Component
 *
 * Splits text into individual words and animates each with a staggered
 * blur-in effect for an editorial, magazine-like feel.
 *
 * Features:
 * - Word-by-word animation with blur effect
 * - Respects reduced motion preferences
 * - Optional scroll-triggered animation
 * - Customizable timing and easing
 */
export const AnimatedText = React.forwardRef<HTMLElement, AnimatedTextProps>(
  (
    {
      text,
      as: Component = 'h1',
      variant = 'blur-in',
      duration = ANIMATION_DURATIONS.slower,
      stagger = EDITORIAL_STAGGER.words,
      delay = 0,
      triggerOnScroll = false,
      scrollStart = 'top 80%',
      className = '',
      onAnimationComplete,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLElement>(null);
    const wordsRef = useRef<HTMLSpanElement[]>([]);
    const { prefersReducedMotion } = useReducedMotion();

    // Split text into words
    const words = text.split(' ').filter((word) => word.length > 0);

    useEffect(() => {
      // Skip animation if reduced motion is preferred
      if (prefersReducedMotion) {
        wordsRef.current.forEach((word) => {
          if (word) {
            gsap.set(word, { opacity: 1, y: 0, filter: 'blur(0px)' });
          }
        });
        return;
      }

      const ctx = gsap.context(() => {
        const validWords = wordsRef.current.filter(Boolean);

        if (validWords.length === 0) return;

        // Set initial state
        gsap.set(validWords, {
          opacity: 0,
          y: 20,
          filter: variant === 'blur-in' ? 'blur(4px)' : 'blur(0px)',
        });

        // Animation configuration based on variant
        const animationConfig = {
          'blur-in': {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration,
            ease: EASING_PRESETS.editorial,
            stagger,
            delay,
            onComplete: onAnimationComplete,
          },
          'fade-up': {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration,
            ease: EASING_PRESETS.smooth,
            stagger,
            delay,
            onComplete: onAnimationComplete,
          },
          'slide-in': {
            opacity: 1,
            y: 0,
            x: 0,
            filter: 'blur(0px)',
            duration,
            ease: EASING_PRESETS.snappy,
            stagger,
            delay,
            onComplete: onAnimationComplete,
          },
        };

        const config = animationConfig[variant];

        if (triggerOnScroll) {
          // Scroll-triggered animation
          gsap.to(validWords, {
            ...config,
            scrollTrigger: {
              trigger: containerRef.current,
              start: scrollStart,
              once: true,
            },
          });
        } else {
          // Immediate animation
          gsap.to(validWords, config);
        }
      }, containerRef);

      return () => ctx.revert();
    }, [
      text,
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

    return React.createElement(
      Component,
      {
        ref: setRefs,
        className: [styles.animatedText, className].filter(Boolean).join(' '),
      },
      words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          ref={(el) => {
            if (el) wordsRef.current[index] = el;
          }}
          className={styles.word}
          style={{
            // Set initial state for SSR/hydration
            opacity: prefersReducedMotion ? 1 : 0,
          }}
        >
          {word}
          {index < words.length - 1 && '\u00A0'}
        </span>
      ))
    );
  }
);

AnimatedText.displayName = 'AnimatedText';
export default AnimatedText;
