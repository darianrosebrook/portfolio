'use client';

import React, { ReactNode, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { useFontsLoaded } from '@/hooks/useFontsLoaded';
import styles from './PageTransition.module.scss';

// Register GSAP plugins
gsap.registerPlugin(useGSAP, SplitText);

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
  onClick?: () => void;
  replace?: boolean;
  /**
   * Enable page transitions for this link
   */
  enableTransition?: boolean;
  /**
   * Transition duration in milliseconds
   */
  transitionDuration?: number;
  /**
   * Enable animated text effects (only works if children is a string)
   */
  enableTextAnimation?: boolean;
  /**
   * Animation stagger timing in milliseconds
   */
  staggerMs?: number;
  /**
   * Animation duration in milliseconds
   */
  animationDurationMs?: number;
}

/**
 * Enhanced navigation link that integrates with the View Transitions API
 * Provides smooth page transitions when supported by the browser
 */
export function NavigationLink({
  href,
  children,
  className,
  'aria-label': ariaLabel,
  onClick,
  replace = false,
  enableTransition = true,
  transitionDuration = 300,
  enableTextAnimation = true,
  staggerMs = 28,
  animationDurationMs = 400,
}: NavigationLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href;
  const fontsLoaded = useFontsLoaded();

  // Refs for animated text functionality
  const rootRef = useRef<HTMLAnchorElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const cloneRef = useRef<HTMLSpanElement | null>(null);

  // Check if children is a string (required for text animation)
  const isStringChildren = typeof children === 'string';
  const shouldAnimateText = enableTextAnimation && isStringChildren;

  // Set up GSAP text animation
  useGSAP(
    () => {
      if (!shouldAnimateText) return;

      const el = rootRef.current;
      const textEl = textRef.current;
      const cloneEl = cloneRef.current;
      if (!el || !textEl || !cloneEl || !fontsLoaded) return;

      // Split text into characters
      const splitText = new SplitText(textEl, {
        type: 'chars',
        charsClass: 'char',
      });

      const splitClone = new SplitText(cloneEl, {
        type: 'chars',
        charsClass: 'char',
      });

      const originalChars = splitText.chars;
      const cloneChars = splitClone.chars;

      // Set initial positions
      gsap.set(originalChars, { yPercent: 0 });
      gsap.set(cloneChars, { yPercent: 100 });

      const t = gsap.timeline({
        paused: true,
        defaults: { ease: 'expo.inOut' },
      });

      t.to(
        originalChars,
        {
          yPercent: -100,
          duration: animationDurationMs / 1000,
          stagger: staggerMs / 1000,
        },
        0
      ).to(
        cloneChars,
        {
          yPercent: 0,
          duration: animationDurationMs / 1000,
          stagger: staggerMs / 1000,
        },
        0
      );

      const onEnter = () => t.play();
      const onLeave = () => t.reverse();

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('focus', onEnter);
      el.addEventListener('blur', onLeave);

      return () => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('focus', onEnter);
        el.removeEventListener('blur', onLeave);
        splitText.revert();
        splitClone.revert();
      };
    },
    { scope: rootRef, dependencies: [children, fontsLoaded, shouldAnimateText] }
  );

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't prevent default if we're not enabling transitions
    if (!enableTransition) {
      if (onClick) onClick();
      return;
    }

    // Check if View Transitions API is supported
    const supportsViewTransitions =
      typeof document !== 'undefined' && 'startViewTransition' in document;

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Only use view transitions if supported and user hasn't disabled animations
    if (supportsViewTransitions && !prefersReducedMotion) {
      e.preventDefault();

      // Start view transition with proper type casting
      const transition = (document as any).startViewTransition(() => {
        // Use Next.js router for navigation to maintain client-side routing
        if (replace) {
          router.replace(href);
        } else {
          router.push(href);
        }
      });

      // Handle transition completion
      transition.finished.finally(() => {
        if (onClick) onClick();
      });
    } else {
      // Let Next.js Link handle the navigation normally
      if (onClick) onClick();
    }
  };

  const linkClasses = [styles.transitionLink, className, isActive && 'active']
    .filter(Boolean)
    .join(' ');

  // If we're using text animation, wrap the children in the animation structure
  const linkContent = shouldAnimateText ? (
    <span className={styles.maskLine}>
      <span ref={textRef} className={styles.text}>
        {children}
      </span>
      <span ref={cloneRef} className={styles.clone} aria-hidden="true">
        {children}
      </span>
    </span>
  ) : (
    children
  );

  return (
    <Link
      ref={shouldAnimateText ? rootRef : undefined}
      href={href}
      className={linkClasses}
      aria-label={ariaLabel}
      aria-current={isActive ? 'page' : undefined}
      onClick={handleClick}
      data-transition-duration={transitionDuration}
    >
      {linkContent}
    </Link>
  );
}

/**
 * Special navigation link for breadcrumbs that includes transition coordination
 */
export function BreadcrumbNavigationLink({
  href,
  children,
  className,
  'aria-label': ariaLabel,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <NavigationLink
      href={href}
      className={className}
      aria-label={ariaLabel}
      enableTransition={true}
      transitionDuration={250}
    >
      {children}
    </NavigationLink>
  );
}

export default NavigationLink;
