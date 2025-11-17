'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './PageTransition.module.scss';

interface PageTransitionProps {
  children: ReactNode;
  /**
   * Unique identifier for the page/route to enable smooth transitions
   */
  transitionName?: string;
  /**
   * Duration of the transition in milliseconds
   */
  duration?: number;
  /**
   * Enable/disable transitions (useful for reduced motion preferences)
   */
  enabled?: boolean;
  /**
   * Custom CSS class for additional styling
   */
  className?: string;
}

/**
 * PageTransition component that provides smooth transitions between pages
 * using the View Transitions API with fallbacks for unsupported browsers.
 *
 * Features:
 * - Automatic View Transitions API detection and usage
 * - Fallback CSS animations for unsupported browsers
 * - Respects user's reduced motion preferences
 * - Customizable transition names and durations
 * - Accessibility-compliant transitions
 */
export function PageTransition({
  children,
  transitionName,
  duration = 300,
  enabled = true,
  className,
}: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if View Transitions API is supported
  const supportsViewTransitions =
    typeof document !== 'undefined' && 'startViewTransition' in document;

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const shouldAnimate = enabled && !prefersReducedMotion;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;

    // Add view-transition-name CSS property for this component
    const element = document.querySelector(
      `[data-transition-name="${transitionName || 'main-content'}"]`
    );
    if (element && supportsViewTransitions) {
      // Set view-transition-name using CSS custom property for now
      (element as HTMLElement).style.setProperty(
        'view-transition-name',
        transitionName || 'main-content'
      );
    }
  }, [transitionName, supportsViewTransitions, shouldAnimate]);

  // Handle route changes with transitions
  useEffect(() => {
    if (!mounted || !shouldAnimate) return;

    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [pathname, duration, shouldAnimate, mounted]);

  if (!mounted) {
    // Prevent hydration mismatch by not rendering on server
    return null;
  }

  const transitionClasses = [
    styles.pageTransition,
    shouldAnimate && styles.enabled,
    isTransitioning && styles.transitioning,
    !supportsViewTransitions && shouldAnimate && styles.fallback,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={transitionClasses}
      data-transition-name={transitionName || 'main-content'}
      data-transition-duration={duration}
      style={
        {
          '--transition-duration': `${duration}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

/**
 * Navigation link component that triggers page transitions
 * Compatible with Next.js Link component
 */
interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
  onClick?: () => void;
  replace?: boolean;
}

export function TransitionLink({
  href,
  children,
  className,
  'aria-label': ariaLabel,
  onClick,
  replace = false,
}: TransitionLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if View Transitions API is supported and user hasn't disabled animations
    const supportsViewTransitions = 'startViewTransition' in document;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (supportsViewTransitions && !prefersReducedMotion) {
      e.preventDefault();

      // Start view transition with proper type casting
      const transition = (document as any).startViewTransition(() => {
        // Navigate to the new page
        if (replace) {
          window.history.replaceState(null, '', href);
        } else {
          window.history.pushState(null, '', href);
        }

        // Trigger a page navigation
        window.location.href = href;
      });

      // Handle transition completion
      transition.finished.finally(() => {
        if (onClick) onClick();
      });
    } else {
      // Fallback to normal navigation
      if (onClick) onClick();
    }
  };

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

export default PageTransition;
