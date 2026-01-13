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
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.scss';

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
   * Children to wrap (trigger element)
   */
  children: React.ReactElement;
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
    const triggerRef = useRef<HTMLElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Update position when visible
    useLayoutEffect(() => {
      if (isVisible) {
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

    // Clone child with event handlers
    type ChildProps = React.HTMLAttributes<HTMLElement> & {
      ref?: React.Ref<HTMLElement>;
    };
    const childProps = (children.props || {}) as ChildProps;

    const triggerElement = React.cloneElement(children, {
      ref: (node: HTMLElement | null) => {
        triggerRef.current = node;

        // Handle forwarded ref from child
        const childRef = (
          children as React.ReactElement & { ref?: React.Ref<HTMLElement> }
        ).ref;
        if (typeof childRef === 'function') {
          childRef(node);
        } else if (childRef) {
          (childRef as React.MutableRefObject<HTMLElement | null>).current =
            node;
        }
      },
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        childProps.onMouseEnter?.(e);
        handleMouseEnter();
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        childProps.onMouseLeave?.(e);
        handleMouseLeave();
      },
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        childProps.onFocus?.(e);
        handleFocus();
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        childProps.onBlur?.(e);
        handleBlur();
      },
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        childProps.onClick?.(e);
        handleClick();
      },
      'aria-describedby': isVisible
        ? tooltipId
        : childProps['aria-describedby'],
    } as ChildProps);

    const tooltipNode = isVisible && (
      <div
        ref={(node) => {
          tooltipRef.current = node;
          if (forwardedRef) {
            if (typeof forwardedRef === 'function') {
              forwardedRef(node);
            } else {
              forwardedRef.current = node;
            }
          }
        }}
        id={tooltipId}
        role="tooltip"
        className={`${styles.tooltip} ${className}`}
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
