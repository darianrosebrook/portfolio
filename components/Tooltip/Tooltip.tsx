import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  cloneElement,
  createPortal,
} from 'react';
import styles from './Tooltip.module.scss';
import {
  TooltipProps,
  TooltipTriggerProps,
  TooltipContentProps,
  TooltipArrowProps,
  TooltipPosition,
  TooltipPlacement,
  TooltipTheme,
  DEFAULT_TOOLTIP_TOKENS,
} from './Tooltip.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './Tooltip.tokens.json';

/**
 * Custom hook for managing Tooltip design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useTooltipTokens(
  theme?: TooltipTheme,
  _size = 'medium',
  _variant = 'default'
) {
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
        inlineTokens[`tooltip-${key}`] = value;
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
        Object.entries(DEFAULT_TOOLTIP_TOKENS).forEach(([key, value]) => {
          fallbacks[`tooltip-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'tooltip');

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

/**
 * Calculate tooltip position based on trigger element and placement
 */
function calculateTooltipPosition(
  triggerElement: HTMLElement,
  tooltipElement: HTMLElement,
  placement: TooltipPlacement,
  offset: number,
  flip: boolean,
  boundary: HTMLElement | 'viewport'
): TooltipPosition {
  const triggerRect = triggerElement.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.pageXOffset;
  const scrollY = window.pageYOffset;

  // Get boundary rect
  const boundaryRect =
    boundary === 'viewport'
      ? { top: 0, left: 0, right: viewportWidth, bottom: viewportHeight }
      : boundary.getBoundingClientRect();

  let top = 0;
  let left = 0;
  let finalPlacement = placement;

  // Calculate initial position based on placement
  switch (placement) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - offset;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      break;
    case 'top-start':
      top = triggerRect.top - tooltipRect.height - offset;
      left = triggerRect.left;
      break;
    case 'top-end':
      top = triggerRect.top - tooltipRect.height - offset;
      left = triggerRect.right - tooltipRect.width;
      break;
    case 'bottom':
      top = triggerRect.bottom + offset;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      break;
    case 'bottom-start':
      top = triggerRect.bottom + offset;
      left = triggerRect.left;
      break;
    case 'bottom-end':
      top = triggerRect.bottom + offset;
      left = triggerRect.right - tooltipRect.width;
      break;
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.left - tooltipRect.width - offset;
      break;
    case 'left-start':
      top = triggerRect.top;
      left = triggerRect.left - tooltipRect.width - offset;
      break;
    case 'left-end':
      top = triggerRect.bottom - tooltipRect.height;
      left = triggerRect.left - tooltipRect.width - offset;
      break;
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.right + offset;
      break;
    case 'right-start':
      top = triggerRect.top;
      left = triggerRect.right + offset;
      break;
    case 'right-end':
      top = triggerRect.bottom - tooltipRect.height;
      left = triggerRect.right + offset;
      break;
  }

  // Check if tooltip would be outside boundary and flip if needed
  if (flip) {
    const wouldBeOutside = {
      top: top < boundaryRect.top,
      bottom: top + tooltipRect.height > boundaryRect.bottom,
      left: left < boundaryRect.left,
      right: left + tooltipRect.width > boundaryRect.right,
    };

    // Flip vertical placements
    if (placement.startsWith('top') && wouldBeOutside.top) {
      finalPlacement = placement.replace('top', 'bottom') as TooltipPlacement;
      top = triggerRect.bottom + offset;
    } else if (placement.startsWith('bottom') && wouldBeOutside.bottom) {
      finalPlacement = placement.replace('bottom', 'top') as TooltipPlacement;
      top = triggerRect.top - tooltipRect.height - offset;
    }

    // Flip horizontal placements
    if (placement.startsWith('left') && wouldBeOutside.left) {
      finalPlacement = placement.replace('left', 'right') as TooltipPlacement;
      left = triggerRect.right + offset;
    } else if (placement.startsWith('right') && wouldBeOutside.right) {
      finalPlacement = placement.replace('right', 'left') as TooltipPlacement;
      left = triggerRect.left - tooltipRect.width - offset;
    }
  }

  // Constrain to boundary
  top = Math.max(
    boundaryRect.top,
    Math.min(top, boundaryRect.bottom - tooltipRect.height)
  );
  left = Math.max(
    boundaryRect.left,
    Math.min(left, boundaryRect.right - tooltipRect.width)
  );

  return {
    top: top + scrollY,
    left: left + scrollX,
    placement: finalPlacement,
  };
}

/**
 * Tooltip Arrow Component
 */
const TooltipArrow: React.FC<TooltipArrowProps> = ({
  placement,
  variant,
  size,
  className = '',
}) => {
  const arrowClasses = [
    styles.tooltipArrow,
    styles[`tooltipArrow--${placement.split('-')[0]}`] || '',
    styles[`tooltipArrow--${variant}`] || '',
    styles[`tooltipArrow--${size}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={arrowClasses} />;
};

/**
 * Tooltip Content Component
 */
const TooltipContent: React.FC<TooltipContentProps> = ({
  children,
  placement,
  size,
  variant,
  showArrow,
  className = '',
  style,
  theme,
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  const { cssProperties } = useTooltipTokens(theme, size, variant);

  const contentClasses = [
    styles.tooltipContent,
    styles[`tooltipContent--${size}`] || '',
    styles[`tooltipContent--${variant}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={contentClasses}
      style={{ ...cssProperties, ...style }}
      role="tooltip"
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {children}
      {showArrow && (
        <TooltipArrow placement={placement} variant={variant} size={size} />
      )}
    </div>
  );
};

/**
 * Tooltip Trigger Component
 */
const TooltipTrigger: React.FC<TooltipTriggerProps> = ({
  children,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onClick,
  onKeyDown,
  'aria-describedby': ariaDescribedBy,
}) => {
  return cloneElement(children, {
    onMouseEnter: (event: React.MouseEvent) => {
      children.props.onMouseEnter?.(event);
      onMouseEnter?.();
    },
    onMouseLeave: (event: React.MouseEvent) => {
      children.props.onMouseLeave?.(event);
      onMouseLeave?.();
    },
    onFocus: (event: React.FocusEvent) => {
      children.props.onFocus?.(event);
      onFocus?.();
    },
    onBlur: (event: React.FocusEvent) => {
      children.props.onBlur?.(event);
      onBlur?.();
    },
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event);
      onClick?.();
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      children.props.onKeyDown?.(event);
      onKeyDown?.(event);
    },
    'aria-describedby': ariaDescribedBy,
  });
};

/**
 * Tooltip Component with Design Token Support
 *
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Smart positioning with collision detection
 * - Multiple trigger modes (hover, click, focus, manual)
 * - Multiple placement options with auto-flipping
 * - Portal rendering for proper z-index
 * - Interactive tooltips that stay open on hover
 * - Configurable delays and animations
 * - Accessibility-first design with ARIA
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  trigger = 'hover',
  size = 'medium',
  variant = 'default',
  theme,
  className = '',
  tooltipClassName = '',
  isOpen: controlledIsOpen,
  showArrow = true,
  showDelay = 0,
  hideDelay = 0,
  interactive = false,
  disabled = false,
  followCursor = false,
  offset: customOffset,
  portalContainer,
  maxWidth,
  flip = true,
  boundary = 'viewport',
  onOpen,
  onClose,
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  // Generate unique IDs
  const tooltipId = useId();

  // Internal state
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentPlacement, setCurrentPlacement] = useState(placement);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  // Refs
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Load and resolve design tokens
  const { tokens } = useTooltipTokens(theme, size, variant);

  // Safe validation for props
  const safeSize = safeTokenValue(size, 'medium', (val) =>
    ['small', 'medium', 'large'].includes(val as string)
  ) as string;

  const safeVariant = safeTokenValue(variant, 'default', (val) =>
    [
      'default',
      'dark',
      'light',
      'error',
      'warning',
      'success',
      'info',
    ].includes(val as string)
  ) as string;

  const safePlacement = safeTokenValue(placement, 'top', (val) =>
    [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ].includes(val as string)
  ) as TooltipPlacement;

  // Determine current open state
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  // Get offset from tokens or custom value
  const offsetValue = customOffset || (tokens['tooltip-offset'] as number) || 8;

  // Normalize trigger to array
  const triggers = Array.isArray(trigger) ? trigger : [trigger];

  // Update tooltip position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current || !isOpen) return;

    const boundaryElement = boundary === 'viewport' ? 'viewport' : boundary;
    const pos = calculateTooltipPosition(
      triggerRef.current,
      tooltipRef.current,
      safePlacement,
      offsetValue,
      flip,
      boundaryElement
    );

    setPosition({ top: pos.top, left: pos.left });
    setCurrentPlacement(pos.placement);
  }, [isOpen, safePlacement, offsetValue, flip, boundary]);

  // Show tooltip
  const showTooltip = useCallback(() => {
    if (disabled) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }

    if (showDelay > 0) {
      showTimeoutRef.current = setTimeout(() => {
        setInternalIsOpen(true);
        onOpen?.();
      }, showDelay);
    } else {
      setInternalIsOpen(true);
      onOpen?.();
    }
  }, [disabled, showDelay, onOpen]);

  // Hide tooltip
  const hideTooltip = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = undefined;
    }

    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        setInternalIsOpen(false);
        onClose?.();
      }, hideDelay);
    } else {
      setInternalIsOpen(false);
      onClose?.();
    }
  }, [hideDelay, onClose]);

  // Handle mouse events
  const handleMouseEnter = useCallback(() => {
    if (triggers.includes('hover')) {
      showTooltip();
    }
  }, [triggers, showTooltip]);

  const handleMouseLeave = useCallback(() => {
    if (triggers.includes('hover') && !interactive) {
      hideTooltip();
    }
  }, [triggers, interactive, hideTooltip]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    if (triggers.includes('focus')) {
      showTooltip();
    }
  }, [triggers, showTooltip]);

  const handleBlur = useCallback(() => {
    if (triggers.includes('focus')) {
      hideTooltip();
    }
  }, [triggers, hideTooltip]);

  // Handle click events
  const handleClick = useCallback(() => {
    if (triggers.includes('click')) {
      if (isOpen) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  }, [triggers, isOpen, showTooltip, hideTooltip]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        hideTooltip();
      }
    },
    [isOpen, hideTooltip]
  );

  // Handle tooltip mouse events for interactive tooltips
  const handleTooltipMouseEnter = useCallback(() => {
    if (interactive && hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }
  }, [interactive]);

  const handleTooltipMouseLeave = useCallback(() => {
    if (interactive && triggers.includes('hover')) {
      hideTooltip();
    }
  }, [interactive, triggers, hideTooltip]);

  // Update position when tooltip opens or placement changes
  useEffect(() => {
    if (isOpen) {
      updatePosition();

      // Update position on scroll/resize
      const handleUpdate = () => updatePosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);

      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isOpen, updatePosition]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Get trigger element ref
  const triggerElement = cloneElement(children, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;
      // Forward ref if it exists
      if (typeof children.ref === 'function') {
        children.ref(node);
      } else if (children.ref) {
        children.ref.current = node;
      }
    },
  });

  // Determine portal container
  const container = portalContainer || document.body;

  // Render tooltip content
  const tooltipContent = isOpen && (
    <TooltipContent
      ref={tooltipRef}
      placement={currentPlacement}
      size={safeSize as any}
      variant={safeVariant as any}
      showArrow={showArrow}
      className={tooltipClassName}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        maxWidth: maxWidth || undefined,
        zIndex: tokens['tooltip-zIndex'] as number,
      }}
      theme={theme}
      aria-label={ariaLabel}
      data-testid={testId}
      onMouseEnter={handleTooltipMouseEnter}
      onMouseLeave={handleTooltipMouseLeave}
    >
      {content}
    </TooltipContent>
  );

  return (
    <>
      <TooltipTrigger
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-describedby={isOpen ? tooltipId : undefined}
      >
        {triggerElement}
      </TooltipTrigger>
      {tooltipContent && createPortal(tooltipContent, container)}
    </>
  );
};

// Export sub-components for advanced usage
export { TooltipContent, TooltipArrow, TooltipTrigger };
export default Tooltip;
export type { TooltipProps, TooltipTheme } from './Tooltip.types';
