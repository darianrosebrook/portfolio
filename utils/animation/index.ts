/**
 * Unified Animation System
 *
 * Centralized animation utilities using GSAP with standardized presets,
 * performance optimizations, and consistent patterns across all components.
 */

import React from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Animation presets for common UI patterns
export const ANIMATION_PRESETS = {
  // Entry animations
  fadeIn: {
    opacity: 0,
    y: 10,
    duration: 0.3,
    ease: 'power2.out',
  },

  slideIn: {
    x: -20,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
  },

  slideInRight: {
    x: 20,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
  },

  slideInUp: {
    y: 20,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
  },

  slideInDown: {
    y: -20,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
  },

  scaleIn: {
    scale: 0.9,
    opacity: 0,
    duration: 0.3,
    ease: 'back.out(1.7)',
  },

  bounceIn: {
    scale: 0.3,
    opacity: 0,
    duration: 0.5,
    ease: 'back.out(1.7)',
  },

  // Exit animations
  fadeOut: {
    opacity: 0,
    y: -10,
    duration: 0.2,
    ease: 'power2.in',
  },

  slideOut: {
    x: -20,
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
  },

  slideOutRight: {
    x: 20,
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
  },

  scaleOut: {
    scale: 0.9,
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
  },

  // State change animations
  press: {
    scale: 0.98,
    duration: 0.1,
    ease: 'power2.out',
  },

  release: {
    scale: 1,
    duration: 0.2,
    ease: 'back.out(1.5)',
  },

  // Hover animations
  lift: {
    y: -2,
    duration: 0.2,
    ease: 'power2.out',
  },

  settle: {
    y: 0,
    duration: 0.3,
    ease: 'power2.out',
  },

  // Loading animations
  pulse: {
    scale: 1.05,
    duration: 0.8,
    ease: 'power2.inOut',
    repeat: -1,
    yoyo: true,
  },

  spin: {
    rotation: 360,
    duration: 1,
    ease: 'none',
    repeat: -1,
  },

  // Notification animations
  slideInTop: {
    y: -100,
    opacity: 0,
    duration: 0.4,
    ease: 'back.out(1.2)',
  },

  slideOutTop: {
    y: -100,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
  },

  // Modal animations
  modalEnter: {
    scale: 0.9,
    opacity: 0,
    duration: 0.3,
    ease: 'back.out(1.7)',
  },

  modalExit: {
    scale: 0.9,
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
  },

  backdropEnter: {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
  },

  backdropExit: {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
  },

  // Editorial animations - sophisticated, magazine-like feel
  editorialBlurIn: {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)',
    duration: 0.8,
    ease: 'M0,0 C0.2,0.65 0.3,0.9 1,1', // Custom "settling" bezier
  },

  editorialFadeIn: {
    opacity: 0,
    y: 30,
    duration: 0.7,
    ease: 'power2.out',
  },

  cardImageZoom: {
    scale: 1.05,
    duration: 0.7,
    ease: 'power2.out',
  },

  imageReveal: {
    opacity: 0,
    scale: 1.02,
    duration: 0.8,
    ease: 'power2.out',
  },

  // Editorial card entry
  cardEntry: {
    opacity: 0,
    y: 20,
    duration: 0.7,
    ease: 'power2.out',
  },
} as const;

// Animation duration presets
export const ANIMATION_DURATIONS = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
} as const;

// Easing presets
export const EASING_PRESETS = {
  smooth: 'power2.out',
  bouncy: 'back.out(1.7)',
  snappy: 'power3.out',
  gentle: 'power1.out',
  linear: 'none',
  // Editorial easing - smooth "settling" effect
  editorial: 'M0,0 C0.2,0.65 0.3,0.9 1,1',
} as const;

// Editorial stagger configurations for sequential animations
export const EDITORIAL_STAGGER = {
  words: 0.08, // Between words in headline
  sections: 0.1, // Between content sections
  cards: 0.08, // Between cards in grid
  listItems: 0.05, // Between list items
} as const;

// Stagger utilities for sequential animations
export const createStaggerConfig = (
  amount: number = 0.1,
  from: 'start' | 'end' | 'center' | number = 'start'
) => ({
  stagger: {
    amount,
    from,
  },
});

// Animation controller for complex sequences
export class AnimationController {
  private animations: Map<string, gsap.core.Timeline | gsap.core.Tween> =
    new Map();
  private isDestroyed = false;

  constructor() {
    // Constructor for initialization if needed
  }

  animate(
    element: Element | string,
    preset: keyof typeof ANIMATION_PRESETS,
    options: {
      id?: string;
      delay?: number;
      onComplete?: () => void;
      onStart?: () => void;
    } = {}
  ) {
    if (this.isDestroyed) return;

    const { id, delay = 0, onComplete, onStart } = options;
    const config: any = { ...ANIMATION_PRESETS[preset] };

    if (delay > 0) {
      config.delay = delay;
    }

    if (onComplete) {
      config.onComplete = onComplete;
    }

    if (onStart) {
      config.onStart = onStart;
    }

    const animation = gsap.to(element, config);

    if (id) {
      this.animations.set(id, animation);
    }

    return animation;
  }

  animateSequence(
    sequence: Array<{
      element: Element | string;
      preset: keyof typeof ANIMATION_PRESETS;
      delay?: number;
      id?: string;
    }>,
    options: {
      stagger?: number;
      onComplete?: () => void;
    } = {}
  ) {
    if (this.isDestroyed) return;

    const { stagger = 0, onComplete } = options;
    const timeline = gsap.timeline({ onComplete });

    sequence.forEach((item, index) => {
      const delay = item.delay ?? index * stagger;
      timeline.to(
        item.element,
        { ...ANIMATION_PRESETS[item.preset], delay },
        delay
      );

      if (item.id) {
        this.animations.set(item.id, timeline);
      }
    });

    return timeline;
  }

  stop(id?: string) {
    if (id) {
      const animation = this.animations.get(id);
      if (animation) {
        animation.kill();
        this.animations.delete(id);
      }
    } else {
      this.animations.forEach((animation) => animation.kill());
      this.animations.clear();
    }
  }

  destroy() {
    this.stop();
    this.isDestroyed = true;
  }
}

// Hook for using animation controller
export function useAnimationController() {
  const controllerRef = React.useRef<AnimationController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new AnimationController();
  }

  React.useEffect(() => {
    return () => {
      controllerRef.current?.destroy();
    };
  }, []);

  return controllerRef.current;
}

// Utility functions for common animation patterns
export const animationUtils = {
  // Animate component mount/unmount
  createMountAnimation: (
    element: Element,
    preset: keyof typeof ANIMATION_PRESETS = 'fadeIn'
  ) => {
    return gsap.fromTo(
      element,
      { opacity: 0, y: 10 },
      ANIMATION_PRESETS[preset]
    );
  },

  // Animate list item additions/removals
  createListAnimation: (
    items: Element[],
    preset: keyof typeof ANIMATION_PRESETS = 'slideIn'
  ) => {
    return gsap.fromTo(
      items,
      { opacity: 0, x: -20 },
      {
        ...ANIMATION_PRESETS[preset],
        stagger: 0.1,
      }
    );
  },

  // Animate form field errors
  createErrorAnimation: (element: Element) => {
    const timeline = gsap.timeline();

    timeline
      .to(element, {
        x: -5,
        duration: 0.1,
        ease: 'power2.inOut',
        repeat: 3,
        yoyo: true,
      })
      .to(
        element,
        {
          borderColor: '#dc3545',
          duration: 0.3,
          ease: 'power2.out',
        },
        0
      );

    return timeline;
  },

  // Animate loading states
  createLoadingAnimation: (element: Element) => {
    return gsap.to(element, {
      opacity: 0.6,
      duration: 0.3,
      ease: 'power2.out',
      repeat: -1,
      yoyo: true,
    });
  },

  // Animate focus states
  createFocusAnimation: (element: Element) => {
    return gsap.to(element, {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
      duration: 0.2,
      ease: 'power2.out',
    });
  },

  // Animate hover states
  createHoverAnimation: (
    element: Element,
    direction: 'up' | 'down' | 'left' | 'right' = 'up'
  ) => {
    const transforms = {
      up: { y: -2 },
      down: { y: 2 },
      left: { x: -2 },
      right: { x: 2 },
    };

    return gsap.to(element, {
      ...transforms[direction],
      duration: 0.2,
      ease: 'power2.out',
    });
  },

  // Editorial text reveal animation (word by word with blur)
  createEditorialTextReveal: (
    words: Element[],
    options: { stagger?: number; delay?: number } = {}
  ) => {
    const { stagger = EDITORIAL_STAGGER.words, delay = 0 } = options;

    return gsap.fromTo(
      words,
      {
        opacity: 0,
        y: 20,
        filter: 'blur(4px)',
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: EASING_PRESETS.editorial,
        stagger,
        delay,
      }
    );
  },

  // Editorial section reveal animation
  createEditorialSectionReveal: (
    sections: Element[],
    options: { stagger?: number; delay?: number } = {}
  ) => {
    const { stagger = EDITORIAL_STAGGER.sections, delay = 0 } = options;

    return gsap.fromTo(
      sections,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger,
        delay,
      }
    );
  },

  // Editorial image reveal animation
  createEditorialImageReveal: (
    element: Element,
    options: { delay?: number } = {}
  ) => {
    const { delay = 0 } = options;

    return gsap.fromTo(
      element,
      {
        opacity: 0,
        scale: 1.02,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay,
      }
    );
  },

  // Editorial card grid stagger animation
  createEditorialCardStagger: (
    cards: Element[],
    options: { stagger?: number; delay?: number } = {}
  ) => {
    const { stagger = EDITORIAL_STAGGER.cards, delay = 0 } = options;

    return gsap.fromTo(
      cards,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger,
        delay,
      }
    );
  },
};

// Performance monitoring for animations
export const animationMonitor = {
  trackAnimation: (
    name: string,
    animation: gsap.core.Tween | gsap.core.Timeline
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎬 Animation started: ${name}`);

      animation.eventCallback('onComplete', () => {
        console.log(`✅ Animation completed: ${name}`);
      });
    }
  },

  // Check for transform/opacity usage (performance best practice)
  validatePerformance: (config: any): boolean => {
    const hasLayoutTriggeringProps = [
      'width',
      'height',
      'margin',
      'padding',
      'border',
    ].some((prop) => Object.keys(config).includes(prop));

    if (hasLayoutTriggeringProps && !config.force3D !== false) {
      console.warn(
        '⚠️ Animation uses layout-triggering properties. Consider using transform/opacity instead.'
      );
      return false;
    }

    return true;
  },
};

// Re-export GSAP for convenience
export { gsap, useGSAP };

// Type exports
export type AnimationPreset = keyof typeof ANIMATION_PRESETS;
export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;
export type EasingPreset = keyof typeof EASING_PRESETS;
export type EditorialStagger = keyof typeof EDITORIAL_STAGGER;
