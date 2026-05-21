/**
 * Tooltip - Non-interactive overlay for labels and descriptions
 * Complements Popover (which is for interactive content)
 *
 * Layer: Compound
 * Uses CSS animations instead of GSAP for boring, predictable behavior.
 */
'use client';
import { Placement, TriggerStrategy } from '@/types/ui';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

export interface TooltipProps {
  /**
   * Tooltip content
   */
  content: React.ReactNode;
  /**
   * Placement relative to trigger
   */
  placement?: Placement;
  /**
   * How the tooltip is triggered
   */
  trigger?: TriggerStrategy;
  /**
   * Delay before showing (ms)
   */
  delay?: number;
  /**
   * Whether tooltip is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Trigger content. Rendered inside a span wrapper that owns the hover/
   * focus/click handlers and the aria-describedby relationship. The wrapper
   * pattern mirrors Popover.Trigger and avoids cloning the user's element.
   */
  children: React.ReactNode;
}

interface Position {
  top: number;
  left: number;
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      placement = 'auto',
      trigger = 'hover',
      delay = 500,
      disabled = false,
      className = '',
      children,
    },
    forwardedRef
  ) => {
    const tooltipId = `tooltip-${useId()}`;
    const triggerRef = useRef<HTMLSpanElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Forward the tooltip element's ref to consumers via the documented
    // React 19 primitive. Tooltip's forwardedRef historically referred to
    // the tooltip overlay (not the trigger), so keep that semantic.
    useImperativeHandle(
      forwardedRef,
      () => tooltipRef.current as HTMLDivElement,
      []
    );

    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

    const updatePosition = useCallback(() => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const offset = 8;

      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - offset;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + offset;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - offset;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + offset;
          break;
        case 'auto':
        default: {
          // Prefer top placement; flip to bottom if overflow
          let calculatedLeft =
            triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          let calculatedTop = triggerRect.top - tooltipRect.height - offset;

          const topOverflow = calculatedTop < 0;
          if (topOverflow) {
            calculatedTop = triggerRect.bottom + offset;
          }

          // Clamp horizontally
          if (calculatedLeft + tooltipRect.width > window.innerWidth) {
            calculatedLeft = window.innerWidth - tooltipRect.width - 8;
          }
          if (calculatedLeft < 8) calculatedLeft = 8;

          top = calculatedTop;
          left = calculatedLeft;
        }
      }

      setPosition({ top, left });
    }, [placement]);

    const showTooltip = useCallback(() => {
      if (disabled || !content) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }, [disabled, content, delay]);

    const hideTooltip = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsVisible(false);
    }, []);

    const handleMouseEnter = useCallback(() => {
      if (trigger === 'hover') showTooltip();
    }, [trigger, showTooltip]);

    const handleMouseLeave = useCallback(() => {
      if (trigger === 'hover') hideTooltip();
    }, [trigger, hideTooltip]);

    const handleFocus = useCallback(() => {
      showTooltip();
    }, [showTooltip]);

    const handleBlur = useCallback(() => {
      hideTooltip();
    }, [hideTooltip]);

    const handleClick = useCallback(() => {
      if (trigger === 'click') {
        if (isVisible) {
          hideTooltip();
        } else {
          showTooltip();
        }
      }
    }, [trigger, isVisible, showTooltip, hideTooltip]);

    // Update position when visible. This is the canonical useLayoutEffect
    // pattern: after layout, measure DOM rects (trigger + tooltip) and
    // setPosition. The setState is exactly the goal of the effect and runs
    // synchronously before paint, so it doesn't cascade visible renders.
    // React Compiler still flags the synchronous setState; suppress with
    // rationale (no cleaner React 18/19 primitive without useEffectEvent).
    useLayoutEffect(() => {
      if (isVisible) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical measure-DOM-then-setPosition in useLayoutEffect
        updatePosition();
      }
    }, [isVisible, updatePosition]);

    // Handle window resize and scroll
    useLayoutEffect(() => {
      if (!isVisible) return;

      const handleUpdate = () => updatePosition();

      window.addEventListener('resize', handleUpdate);
      window.addEventListener('scroll', handleUpdate);

      return () => {
        window.removeEventListener('resize', handleUpdate);
        window.removeEventListener('scroll', handleUpdate);
      };
    }, [isVisible, updatePosition]);

    // Cleanup timeout on unmount
    useLayoutEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    // WCAG 2.1 SC 1.4.13: Escape dismisses a visible tooltip
    useEffect(() => {
      if (!isVisible) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') hideTooltip();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, hideTooltip]);

    // Wrapper span owns the ref, event handlers, and aria-describedby
    // relationship. display:contents keeps it layout-transparent so the
    // user's child element remains the visible/positionable thing.
    // onFocus/onBlur bubble, so focus events on inner focusable children
    // (button, link, etc.) reach this wrapper and trigger the tooltip.
    // Mirror onClick for keyboard-activated children (Enter/Space on a
    // <button> dispatches a click that bubbles here, but Space-then-keyup
    // doesn't synthesize click on non-button focusables, so listen for the
    // key directly).
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLSpanElement>) => {
        if (trigger === 'click' && (e.key === 'Enter' || e.key === ' ')) {
          handleClick();
        }
      },
      [trigger, handleClick]
    );

    const triggerElement = (
      <span
        ref={triggerRef}
        className="tooltipTrigger"
        style={{ display: 'contents' }}
        data-slot="tooltip-trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-describedby={isVisible ? tooltipId : undefined}
      >
        {children}
      </span>
    );

    const tooltipNode = isVisible && (
      <div
        ref={tooltipRef}
        data-ds-component="Tooltip"
        id={tooltipId}
        role="tooltip"
        data-slot="tooltip"
        className={`tooltip ${className}`}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );

    return (
      <>
        {triggerElement}
        {typeof document !== 'undefined' && tooltipNode
          ? createPortal(tooltipNode, document.body)
          : tooltipNode}
      </>
    );
  }
);

Tooltip.displayName = 'Tooltip';

export { Tooltip };
export default Tooltip;
