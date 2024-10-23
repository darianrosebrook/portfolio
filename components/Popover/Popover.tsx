'use client';
import React, { useRef, useId, useContext, createContext, useLayoutEffect, useState, useCallback, forwardRef, MutableRefObject } from 'react';
import { gsap } from 'gsap';
import styles from './Popover.module.scss';

interface PopoverProps {
  children: React.ReactNode;
  offset?: number;
}

interface TriggerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

interface ContentProps {
  children: React.ReactNode;
  className?: string;
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
}

const PopoverContext = createContext<PopoverContextType | null>(null);

const Popover: React.FC<PopoverProps> & {
  Trigger: React.FC<TriggerProps>;
  Content: React.FC<ContentProps>;
} = ({ children, offset = 8 }) => {
  const popoverId = `popover-${useId()}`;
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const updatePosition = useCallback(() => {
    if (triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      // Calculate initial positions
      let left = triggerRect.left + offset;
      let top = triggerRect.bottom + offset;

      // Check right edge overflow
      if (left + contentRect.width > window.innerWidth) {
        // Try to align with right edge of trigger
        left = triggerRect.right - contentRect.width - offset;

        // If still overflowing, align with window edge with small margin
        if (left < 0) {
          left = window.innerWidth - contentRect.width - 16;
        }
      }

      // Check left edge overflow
      if (left < 0) {
        left = 10; // Small margin from left edge
      }

      // Check bottom edge overflow
      const bottomOverflow = top + contentRect.height > window.innerHeight;
      if (bottomOverflow) {
        // Position above the trigger
        top = triggerRect.top - contentRect.height - offset;
      }

      setPosition({ top, left });
    }
  }, [offset]);

  return (
    <PopoverContext.Provider value={{
      popoverId,
      triggerRef,
      contentRef,
      position,
      updatePosition,
      isOpen,
      setIsOpen,
      offset
    }}>
      <div className={styles.popoverContainer}>{children}</div>
    </PopoverContext.Provider>
  );
};

const Trigger = forwardRef<HTMLElement, TriggerProps>(({
  children,
  className,
  as: Component = 'div'
}, forwardedRef) => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error('Popover.Trigger must be used within a Popover component');
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

  return (
    <Component
      ref={handleRefs}
      className={`${styles.popoverTrigger} ${isOpen ? styles.activeTrigger : ''} ${className || ''}`}
      onClick={handleClick}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      {children}
    </Component>
  );
});

Trigger.displayName = 'Trigger';

const Content: React.FC<ContentProps> = ({ children, className }) => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error('Popover.Content must be used within a Popover component');
  }

  const { popoverId, position, updatePosition, isOpen, contentRef } = context;
  const animationRef = useRef (null);

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
      animationRef.current = gsap.fromTo(
        contentRef.current,
        { autoAlpha: 0, y: -10},
        {
          duration: 0.3,
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
  }, [updatePosition, isOpen, contentRef]);

  useLayoutEffect(() => {
    if (!isOpen && contentRef.current && animationRef.current) {
      gsap.to(contentRef.current, {
        duration: 0.2,
        autoAlpha: 0,
        scale: 0.8,
        ease: 'power2.in',
      });
    }
  }, [isOpen, contentRef]);

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
      }}
    >
      {children}
    </div>
  );
};

Popover.Trigger = Trigger;
Popover.Content = Content;

export default Popover;