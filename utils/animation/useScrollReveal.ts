'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/context/ReducedMotionContext';
import { EASING_PRESETS, ANIMATION_DURATIONS, EDITORIAL_STAGGER } from '.';

// Register ScrollTrigger exactly once, on the client. Every call site used to
// repeat this guard; centralizing it here removes that duplication.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type ScrollRevealVariant = 'fade' | 'fade-up' | 'blur-in' | 'scale';

export interface ScrollRevealOptions {
  /** Animation style. Defaults to 'fade-up'. */
  variant?: ScrollRevealVariant;
  /**
   * What to animate:
   * - 'self' (default): the container element itself
   * - 'children': the container's direct children, staggered
   */
  target?: 'self' | 'children';
  /** Reveal when the element scrolls into view instead of on mount. */
  triggerOnScroll?: boolean;
  /** ScrollTrigger start position (only used when triggerOnScroll). */
  scrollStart?: string;
  /** Seconds between staggered children (only used when target='children'). */
  stagger?: number;
  /** Delay before the reveal starts, in seconds. */
  delay?: number;
  /** Reveal duration, in seconds. */
  duration?: number;
  /** GSAP ease. Defaults to the editorial "settling" ease. */
  ease?: string;
  /** Vertical travel distance for 'fade-up', in px. Defaults to 20. */
  y?: number;
}

/**
 * useScrollReveal
 *
 * One place for the reveal pattern that was copy-pasted across the public
 * pages: register ScrollTrigger, run a GSAP context, respect reduced motion,
 * and revert on unmount.
 *
 * FOUC / no-JS behavior: the element's resting (revealed) state is its normal
 * CSS — this hook never leaves anything at `opacity: 0` in the server markup.
 * Without JavaScript, content is fully visible. When JS runs and motion is
 * allowed, the hidden starting state is applied via `gsap.set()` inside
 * `useGSAP` (a pre-paint layout effect) and then animated in. With
 * `prefers-reduced-motion`, the hook does nothing, so content simply shows.
 *
 * Attach the returned ref to the element you want to reveal:
 *
 * ```tsx
 * const ref = useScrollReveal<HTMLDivElement>({ variant: 'fade-up' });
 * return <div ref={ref}>…</div>;
 * ```
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const {
    variant = 'fade-up',
    target = 'self',
    triggerOnScroll = false,
    scrollStart = 'top 80%',
    stagger = EDITORIAL_STAGGER.sections,
    delay = 0,
    duration = ANIMATION_DURATIONS.slow,
    ease = EASING_PRESETS.editorial,
    y = 20,
  } = options;

  const ref = useRef<T>(null);
  const { prefersReducedMotion } = useReducedMotion();

  useGSAP(
    () => {
      const container = ref.current;
      if (!container) return;

      const targets: Element[] =
        target === 'children'
          ? Array.from(container.children)
          : [container];
      if (targets.length === 0) return;

      // Reduced motion: leave the resting (visible) state untouched.
      if (prefersReducedMotion) return;

      const hiddenState: gsap.TweenVars = { opacity: 0 };
      const shownState: gsap.TweenVars = { opacity: 1 };
      if (variant === 'fade-up') {
        hiddenState.y = y;
        shownState.y = 0;
      } else if (variant === 'blur-in') {
        hiddenState.filter = 'blur(4px)';
        hiddenState.y = y;
        shownState.filter = 'blur(0px)';
        shownState.y = 0;
      } else if (variant === 'scale') {
        hiddenState.scale = 1.02;
        shownState.scale = 1;
      }

      // Hide before paint (useGSAP runs in a layout effect), then reveal.
      gsap.set(targets, hiddenState);

      gsap.to(targets, {
        ...shownState,
        duration,
        ease,
        delay,
        ...(target === 'children' ? { stagger } : {}),
        ...(triggerOnScroll
          ? {
              scrollTrigger: {
                trigger: container,
                start: scrollStart,
                once: true,
              },
            }
          : {}),
      });
    },
    { scope: ref, dependencies: [prefersReducedMotion] }
  );

  return ref;
}

export default useScrollReveal;
