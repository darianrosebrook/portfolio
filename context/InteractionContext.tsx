import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { Observer } from 'gsap/Observer';
import { gsap } from 'gsap';
import { useReducedMotion } from './ReducedMotionContext';
import type {
  InteractionContextValue,
  MouseState,
  ScrollState,
  WindowSize,
} from '@/types/app/interaction';

gsap.registerPlugin(Observer);

const defaultMouse: MouseState = {
  x: 0,
  y: 0,
  velocityX: 0,
  velocityY: 0,
  isPressed: false,
  isDragging: false,
  hasMouseMoved: false,
  hoveredTarget: undefined,
};

const defaultScroll: ScrollState = {
  x: 0,
  y: 0,
  direction: null,
};

const defaultWindow: WindowSize = {
  width: 0,
  height: 0,
};

const InteractionContext = createContext<InteractionContextValue | undefined>(
  undefined
);

export const InteractionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { prefersReducedMotion, setPrefersReducedMotion } = useReducedMotion();
  
  // Mouse state - use refs for high-frequency updates, state for infrequent ones
  const mouseRef = useRef<MouseState>({ ...defaultMouse });
  const [mouse, setMouse] = useState<MouseState>({ ...defaultMouse });

  // Scroll state
  const scrollRef = useRef<ScrollState>({ ...defaultScroll });
  const [scroll, setScroll] = useState<ScrollState>({ ...defaultScroll });

  // Window size
  const [windowSize, setWindowSize] = useState<WindowSize>({
    ...defaultWindow,
  });

  // Use requestAnimationFrame for smooth, frame-synced cursor updates
  const rafIdRef = useRef<number | null>(null);
  const updateMousePosition = useCallback(() => {
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        setMouse({ ...mouseRef.current });
        rafIdRef.current = null;
      });
    }
  }, []);

  // Mouse/scroll observer
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const observer = Observer.create({
      target: window,
      type: 'pointer, wheel, touch',
      onMove: (self) => {
        mouseRef.current = {
          ...mouseRef.current,
          x: self.x ?? 0,
          y: self.y ?? 0,
          velocityX: self.velocityX,
          velocityY: self.velocityY,
          hasMouseMoved: true,
        };
        // Use requestAnimationFrame for smooth, frame-synced updates
        updateMousePosition();
      },
      onPress: () => {
        mouseRef.current.isPressed = true;
        setMouse({ ...mouseRef.current });
      },
      onRelease: () => {
        mouseRef.current.isPressed = false;
        mouseRef.current.isDragging = false;
        setMouse({ ...mouseRef.current });
      },
      onDragStart: () => {
        mouseRef.current.isDragging = true;
        setMouse({ ...mouseRef.current });
      },
      onDragEnd: () => {
        mouseRef.current.isDragging = false;
        setMouse({ ...mouseRef.current });
      },
    });
    
    return () => {
      observer.kill();
      // Clean up pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [prefersReducedMotion, updateMousePosition]);

  // Scroll tracking with throttling
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    let lastScrollY = window.scrollY;
    let lastScrollX = window.scrollX;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const x = window.scrollX;
          const y = window.scrollY;
          let direction: ScrollState['direction'] = null;
          if (y > lastScrollY) direction = 'down';
          else if (y < lastScrollY) direction = 'up';
          else if (x > lastScrollX) direction = 'right';
          else if (x < lastScrollX) direction = 'left';
          lastScrollY = y;
          lastScrollX = x;
          scrollRef.current = { x, y, direction };
          setScroll({ ...scrollRef.current });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  // Window size listener with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    // Set initial size
    handleResize();
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Provide setHoveredTarget to update hoveredTarget in mouse state
  const setHoveredTarget = useCallback((target: string | undefined) => {
    mouseRef.current.hoveredTarget = target;
    setMouse((prev) => ({ ...prev, hoveredTarget: target }));
  }, []);

  // Provide context value - memoized to prevent unnecessary re-renders
  const contextValue = useMemo<InteractionContextValue>(
    () => ({
      mouse,
      scroll,
      window: windowSize,
      prefersReducedMotion,
      setPrefersReducedMotion,
      setHoveredTarget,
    }),
    [
      mouse,
      scroll,
      windowSize,
      prefersReducedMotion,
      setPrefersReducedMotion,
      setHoveredTarget,
    ]
  );

  return (
    <InteractionContext.Provider value={contextValue}>
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteraction = () => {
  const context = useContext(InteractionContext);
  if (!context)
    throw new Error(
      'useInteraction must be used within an InteractionProvider'
    );
  return context;
};
