import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
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
  // Mouse state
  const mouseRef = useRef<MouseState>({ ...defaultMouse });
  const [mouse, setMouse] = useState<MouseState>({ ...defaultMouse });

  // Scroll state
  const scrollRef = useRef<ScrollState>({ ...defaultScroll });
  const [scroll, setScroll] = useState<ScrollState>({ ...defaultScroll });

  // Window size
  const [windowSize, setWindowSize] = useState<WindowSize>({
    ...defaultWindow,
  });

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
        setMouse({ ...mouseRef.current });
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
    return () => observer.kill();
  }, [prefersReducedMotion]);

  // Scroll tracking
  useEffect(() => {
    if (prefersReducedMotion) return;
    let lastScrollY = window.scrollY;
    let lastScrollX = window.scrollX;
    const handleScroll = () => {
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
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  // Window size listener
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Provide setHoveredTarget to update hoveredTarget in mouse state
  const setHoveredTarget = (target: string | undefined) => {
    mouseRef.current.hoveredTarget = target;
    setMouse((prev) => ({ ...prev, hoveredTarget: target }));
  };

  // Provide context value
  const contextValue = React.useMemo(
    () => ({
      mouse,
      scroll,
      window: windowSize,
      prefersReducedMotion,
      setPrefersReducedMotion,
      setHoveredTarget,
    }),
    [mouse, scroll, windowSize, prefersReducedMotion, setPrefersReducedMotion]
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
