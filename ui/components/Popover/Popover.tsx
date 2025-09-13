'use client';
import React, {
  useRef,
  useId,
  useContext,
  createContext,
  useLayoutEffect,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  MutableRefObject,
} from 'react';
import { gsap } from 'gsap';
import styles from './Popover.module.scss';

interface PopoverProps {
  children: React.ReactNode;
  offset?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  triggerStrategy?: 'click' | 'hover';
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  className?: string;
}

interface TriggerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  onClick?: (e: React.MouseEvent) => void;
}

interface ContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface Position {
  top: number;
  left: number;
}

interface PopoverContextType {
  popoverId: string;
  triggerRef: MutableRefObject<HTMLElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
  position: Position;
  updatePosition: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  offset: number;
  placement: Required<NonNullable<PopoverProps['placement']>>;
  triggerStrategy: Required<NonNullable<PopoverProps['triggerStrategy']>>;
  closeOnOutsideClick: boolean;
  closeOnEscape: boolean;
}

const PopoverContext = createContext<PopoverContextType | null>(null);

const Popover: React.FC<PopoverProps> & {
  Trigger: React.FC<TriggerProps>;
  Content: React.FC<ContentProps>;
} = ({
  children,
  offset = 8,
  placement = 'auto',
  triggerStrategy = 'click',
  closeOnOutsideClick = true,
  closeOnEscape = true,
  className,
  onOpen,
  onClose,
}) => {
  const popoverId = `popover-${useId()}`;
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const updatePosition = useCallback(() => {
    if (triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = triggerRect.top - contentRect.height - offset;
          left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + offset;
          left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
          left = triggerRect.left - contentRect.width - offset;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
          left = triggerRect.right + offset;
          break;
        case 'auto':
        default: {
          let calculatedLeft = triggerRect.left + offset;
          let calculatedTop = triggerRect.bottom + offset;

          if (calculatedLeft + contentRect.width > window.innerWidth) {
            calculatedLeft = triggerRect.right - contentRect.width - offset;
            if (calculatedLeft < 0) {
              calculatedLeft = window.innerWidth - contentRect.width - 16;
            }
          }

          if (calculatedLeft < 0) {
            calculatedLeft = 10;
          }

          const bottomOverflow =
            calculatedTop + contentRect.height > window.innerHeight;
          if (bottomOverflow) {
            calculatedTop = triggerRect.top - contentRect.height - offset;
          }

          top = calculatedTop;
          left = calculatedLeft;
        }
      }

      setPosition({ top, left });
    }
  }, [offset, placement]);

  // Open/Close side effects
  useLayoutEffect(() => {
    if (isOpen) onOpen?.();
    else onClose?.();
  }, [isOpen, onOpen, onClose]);

  // Outside click and Escape handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isOpen) return;
      if (contentRef.current && triggerRef.current) {
        const isInside =
          contentRef.current.contains(e.target as Node) ||
          triggerRef.current.contains(e.target as Node);
        if (!isInside) setIsOpen(false);
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };

    if (closeOnOutsideClick)
      document.addEventListener('mousedown', handleClickOutside);
    if (closeOnEscape) document.addEventListener('keydown', handleEscapeKey);

    return () => {
      if (closeOnOutsideClick) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
      if (closeOnEscape) {
        document.removeEventListener('keydown', handleEscapeKey);
      }
    };
  }, [isOpen, closeOnOutsideClick, closeOnEscape]);

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
        offset,
        placement,
        triggerStrategy,
        closeOnOutsideClick,
        closeOnEscape,
      }}
    >
      <div className={`${styles.popoverContainer} ${className || ''}`}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const Trigger = forwardRef<HTMLElement, TriggerProps>(
  ({ children, className, as: Component = 'div', onClick }, forwardedRef) => {
    const context = useContext(PopoverContext);

    if (!context) {
      throw new Error(
        'Popover.Trigger must be used within a Popover component'
      );
    }

    const { triggerRef, isOpen, setIsOpen, triggerStrategy } = context;

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

    const handleClick = (e: React.MouseEvent) => {
      if (triggerStrategy === 'click') setIsOpen(!isOpen);
      onClick?.(e);
    };

    const handleMouseEnter = () => {
      if (triggerStrategy === 'hover') setIsOpen(true);
    };

    const handleMouseLeave = () => {
      if (triggerStrategy === 'hover') setIsOpen(false);
    };

    return (
      <Component
        ref={handleRefs}
        className={`${styles.popoverTrigger} ${isOpen ? styles.activeTrigger : ''} ${className || ''}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {children}
      </Component>
    );
  }
);

Trigger.displayName = 'Trigger';

const Content: React.FC<ContentProps> = ({ children, className, style }) => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error('Popover.Content must be used within a Popover component');
  }

  const { popoverId, position, updatePosition, isOpen, contentRef } = context;
  const animationRef = useRef<gsap.core.Tween | null>(null);

  // Get motion tokens from CSS variables
  const getMotionTokens = useCallback(() => {
    const style = getComputedStyle(document.documentElement);
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    return {
      duration: {
        fast: prefersReducedMotion
          ? 0
          : parseFloat(style.getPropertyValue('--semantic-duration-fast')) /
            1000,
        medium: prefersReducedMotion
          ? 0
          : parseFloat(style.getPropertyValue('--semantic-duration-medium')) /
            1000,
      },
      easing: {
        standard: style.getPropertyValue('--semantic-easing-standard').trim(),
        emphasized: style
          .getPropertyValue('--semantic-easing-emphasized')
          .trim(),
        decelerated: style
          .getPropertyValue('--semantic-easing-decelerated')
          .trim(),
      },
      prefersReducedMotion,
    };
  }, []);

  useLayoutEffect(() => {
    if (contentRef.current && isOpen) {
      // Initial position update
      updatePosition();

      // Setup resize observer to handle content size changes
      const resizeObserver = new ResizeObserver(() => {
        updatePosition();
      });
      resizeObserver.observe(contentRef.current);

      // Animation
      const contentElement = contentRef.current;
      const tokens = getMotionTokens();

      contentElement.style.opacity = '0';
      contentElement.style.transform = 'translateY(-10px) scale(0.95)';

      animationRef.current = gsap.to(contentElement, {
        duration: tokens.duration.medium,
        opacity: 1,
        y: 0,
        scale: 1,
        ease: tokens.prefersReducedMotion ? 'none' : 'back.out(1.7)',
        onComplete: () => {},
      });

      // Event listeners for window resize and scroll
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
        if (animationRef.current) animationRef.current.kill();
        contentElement.style.transform = '';
        contentElement.style.opacity = '';
      };
    }
  }, [updatePosition, isOpen, contentRef, getMotionTokens]);

  useLayoutEffect(() => {
    if (!isOpen && contentRef.current) {
      const contentElement = contentRef.current;
      const tokens = getMotionTokens();

      const animation = gsap.to(contentElement, {
        duration: tokens.duration.fast,
        opacity: 0,
        scale: 0.95,
        ease: tokens.prefersReducedMotion ? 'none' : 'power2.in',
        onComplete: () => {},
      });
      return () => {
        animation.kill();
      };
    }
  }, [isOpen, contentRef, getMotionTokens]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      id={popoverId}
      className={`${styles.popoverContent} ${className || ''}`}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

Popover.Trigger = Trigger;
Popover.Content = Content;

export default Popover;
