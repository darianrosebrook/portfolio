'use client';
import React, {
  useRef,
  useId,
  useContext,
  createContext,
  useLayoutEffect,
  useState,
  useCallback,
  forwardRef,
  useMemo,
} from 'react';
import { gsap } from 'gsap';
import styles from './Popover.module.scss';
import {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverContextType,
  PopoverTheme,
  PopoverPosition,
  DEFAULT_POPOVER_TOKENS,
} from './Popover.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './Popover.tokens.json';

/**
 * Custom hook for managing Popover design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function usePopoverTokens(theme?: PopoverTheme) {
  return useMemo(() => {
    const tokenSources: TokenSource[] = [];

    // 1. Start with JSON token configuration
    tokenSources.push({
      type: 'json',
      data: defaultTokenConfig,
    });

    // 2. Add external token config if provided
    if (theme?.tokenConfig) {
      tokenSources.push({
        type: 'json',
        data: theme.tokenConfig,
      });
    }

    // 3. Add inline token overrides
    if (theme?.tokens) {
      const inlineTokens: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([key, value]) => {
        inlineTokens[`popover-${key}`] = value;
      });

      tokenSources.push({
        type: 'inline',
        tokens: inlineTokens,
      });
    }

    // Merge all token sources with fallbacks
    const resolvedTokens = mergeTokenSources(tokenSources, {
      fallbacks: (() => {
        const fallbacks: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_POPOVER_TOKENS).forEach(([key, value]) => {
          fallbacks[`popover-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'popover');

    // Add any direct CSS property overrides
    if (theme?.cssProperties) {
      Object.assign(cssProperties, theme.cssProperties);
    }

    return {
      tokens: resolvedTokens,
      cssProperties,
    };
  }, [theme]);
}

const PopoverContext = createContext<PopoverContextType | null>(null);

/**
 * Popover Component with Design Token Support
 * 
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Accessibility-first design
 * - GSAP animations with token-based timing
 */
const Popover: React.FC<PopoverProps> & {
  Trigger: React.FC<PopoverTriggerProps>;
  Content: React.FC<PopoverContentProps>;
} = ({ children, offset = 8, theme, className = '' }) => {
  // Load and resolve design tokens
  const { cssProperties, tokens } = usePopoverTokens(theme);

  const popoverId = `popover-${useId()}`;
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
  const [isOpen, setIsOpen] = useState(false);

  // Safe token values with validation
  const safeOffset = safeTokenValue(
    offset,
    8,
    (val) => typeof val === 'number' && val >= 0
  ) as number;

  const edgeMargin = safeTokenValue(
    tokens['popover-positioning-edgeMargin'],
    10,
    (val) => typeof val === 'string' && !isNaN(parseFloat(val))
  ) as string;

  const windowMargin = safeTokenValue(
    tokens['popover-positioning-windowMargin'],
    16,
    (val) => typeof val === 'string' && !isNaN(parseFloat(val))
  ) as string;

  const updatePosition = useCallback(() => {
    if (triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      // Calculate initial positions
      let left = triggerRect.left + safeOffset;
      let top = triggerRect.bottom + safeOffset;

      const edgeMarginValue = parseFloat(edgeMargin);
      const windowMarginValue = parseFloat(windowMargin);

      // Check right edge overflow
      if (left + contentRect.width > window.innerWidth) {
        // Try to align with right edge of trigger
        left = triggerRect.right - contentRect.width - safeOffset;

        // If still overflowing, align with window edge with margin
        if (left < 0) {
          left = window.innerWidth - contentRect.width - windowMarginValue;
        }
      }

      // Check left edge overflow
      if (left < 0) {
        left = edgeMarginValue;
      }

      // Check bottom edge overflow
      const bottomOverflow = top + contentRect.height > window.innerHeight;
      if (bottomOverflow) {
        // Position above the trigger
        top = triggerRect.top - contentRect.height - safeOffset;
      }

      setPosition({ top, left });
    }
  }, [safeOffset, edgeMargin, windowMargin]);

  return (
    <PopoverContext.Provider
      value={{
        popoverId,
        triggerRef,
        contentRef,
        position,
        updatePosition,
        isOpen,
        setIsOpen,
        offset: safeOffset,
      }}
    >
      <div 
        className={`${styles.popoverContainer} ${className}`}
        style={cssProperties}
      >
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

/**
 * Popover Trigger Component
 */
const Trigger = forwardRef<HTMLElement, PopoverTriggerProps>(
  ({ children, className = '', as: Component = 'div' }, forwardedRef) => {
    const context = useContext(PopoverContext);

    if (!context) {
      throw new Error(
        'Popover.Trigger must be used within a Popover component'
      );
    }

    const { triggerRef, isOpen, setIsOpen } = context;

    const handleRefs = (element: HTMLElement | null) => {
      triggerRef.current = element;

      if (forwardedRef) {
        if (typeof forwardedRef === 'function') {
          forwardedRef(element);
        } else {
          forwardedRef.current = element;
        }
      }
    };

    const handleClick = () => {
      setIsOpen(!isOpen);
    };

    const triggerClassName = [
      styles.popoverTrigger,
      isOpen ? styles.activeTrigger : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Component
        ref={handleRefs}
        className={triggerClassName}
        onClick={handleClick}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {children}
      </Component>
    );
  }
);

Trigger.displayName = 'Popover.Trigger';

/**
 * Popover Content Component with Token-based Animations
 */
const Content: React.FC<PopoverContentProps> = ({ children, className = '' }) => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error('Popover.Content must be used within a Popover component');
  }

  const { popoverId, position, updatePosition, isOpen, contentRef } = context;
  const animationRef = useRef<gsap.core.Tween | null>(null);

  // Get animation tokens from CSS properties
  const computedStyle = contentRef.current 
    ? getComputedStyle(contentRef.current) 
    : null;

  const animationDurationEnter = computedStyle
    ? computedStyle.getPropertyValue('--popover-animation-duration-enter') || '0.3s'
    : '0.3s';

  const animationDurationExit = computedStyle
    ? computedStyle.getPropertyValue('--popover-animation-duration-exit') || '0.2s'
    : '0.2s';

  const animationTranslateY = computedStyle
    ? computedStyle.getPropertyValue('--popover-animation-translateY-enter') || '-10px'
    : '-10px';

  const animationScaleExit = computedStyle
    ? computedStyle.getPropertyValue('--popover-animation-scale-exit') || '0.8'
    : '0.8';

  useLayoutEffect(() => {
    if (contentRef.current && isOpen) {
      // Initial position update
      updatePosition();

      // Setup resize observer to handle content size changes
      const resizeObserver = new ResizeObserver(() => {
        updatePosition();
      });
      resizeObserver.observe(contentRef.current);

      // Animation with token-based values
      animationRef.current = gsap.fromTo(
        contentRef.current,
        { 
          autoAlpha: 0, 
          y: parseFloat(animationTranslateY) 
        },
        {
          duration: parseFloat(animationDurationEnter),
          autoAlpha: 1,
          y: 0,
          ease: 'back.out(1.7)',
        }
      );

      // Event listeners for window resize and scroll
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
        if (animationRef.current) {
          animationRef.current.kill();
        }
      };
    }
  }, [updatePosition, isOpen, animationDurationEnter, animationTranslateY]);

  useLayoutEffect(() => {
    if (!isOpen && contentRef.current && animationRef.current) {
      gsap.to(contentRef.current, {
        duration: parseFloat(animationDurationExit),
        autoAlpha: 0,
        scale: parseFloat(animationScaleExit),
        ease: 'power2.in',
      });
    }
  }, [isOpen, animationDurationExit, animationScaleExit]);

  if (!isOpen) return null;

  const contentClassName = [
    styles.popoverContent,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={contentRef}
      id={popoverId}
      className={contentClassName}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>
  );
};

Content.displayName = 'Popover.Content';

Popover.Trigger = Trigger;
Popover.Content = Content;

export default Popover;
export type { PopoverProps, PopoverTheme } from './Popover.types';