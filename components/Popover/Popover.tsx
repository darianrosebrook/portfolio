// Popover.tsx
'use client';
import React, {
  useRef,
  useId,
  useContext,
  createContext,
  useLayoutEffect,
  useState,
  useCallback,
} from 'react';
import { gsap } from 'gsap';
import styles from './Popover.module.scss';

interface PopoverProps {
  children: React.ReactNode;
}

interface TriggerProps {
  children: React.ReactNode;
  className?: string;
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
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  position: Position;
  updatePosition: () => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopoverContext = createContext<PopoverContextType | null>(null);

const Popover: React.FC<PopoverProps> & {
  Trigger: React.FC<TriggerProps>;
  Content: React.FC<ContentProps>;
} = ({ children }) => {
  const popoverId = `popover-${useId()}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const updatePosition = useCallback(() => {
    if (triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      let top = triggerRect.bottom + 8;
      let left = triggerRect.left;
      if (triggerRect.left + contentRect.width > viewportWidth) {
        left = triggerRect.right - contentRect.width;
      }
      if (triggerRect.bottom + contentRect.height + 8 > viewportHeight) {
        top = triggerRect.top - contentRect.height - 8;
      }
      setPosition({ top, left });
    }
  }, []);

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
      }}
    >
      <div className={styles.popoverContainer}>{children}</div>
    </PopoverContext.Provider>
  );
};
 
const Trigger: React.FC<TriggerProps> = ({ children, className }) => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error('Popover.Trigger must be used within a Popover component');
  }

  const { triggerRef, isOpen, setIsOpen } = context;

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <button
      ref={triggerRef}
      className={`${styles.popoverTrigger} ${isOpen ? styles.activeTrigger : ''} `}
      onClick={handleClick}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      {children}
    </button>
  );
}; 
const Content: React.FC<ContentProps> = ({ children, className }) => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error('Popover.Content must be used within a Popover component');
  }

  const {
    popoverId,
    position,
    updatePosition,
    contentRef,
    isOpen,
    setIsOpen,
    triggerRef,
  } = context;

  useLayoutEffect(() => {
    const popover = contentRef.current;

    if (popover && isOpen) {
      // Ensure the popover is rendered before measuring
      requestAnimationFrame(() => {
        updatePosition();

        gsap.fromTo(
          popover,
          { autoAlpha: 0, scale: 0.8 },
          {
            duration: 0.3,
            autoAlpha: 1,
            scale: 1,
            ease: 'back.out(1.7)',
          }
        );
      });

      const handleResizeOrScroll = () => {
        updatePosition();
      };

      const handleClickOutside = (event: MouseEvent) => {
        if (
          contentRef.current &&
          triggerRef.current &&
          !contentRef.current.contains(event.target as Node) &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      window.addEventListener('resize', handleResizeOrScroll);
      window.addEventListener('scroll', handleResizeOrScroll);
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('resize', handleResizeOrScroll);
        window.removeEventListener('scroll', handleResizeOrScroll);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, updatePosition, setIsOpen, triggerRef, contentRef]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={contentRef}
      id={popoverId}
      className={`${styles.popoverContent} ${className || ''}`}
      style={{
        position: 'absolute',
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
