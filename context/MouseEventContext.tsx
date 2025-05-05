import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Observer } from 'gsap/Observer';
import { gsap } from 'gsap';
import { useReducedMotion } from './ReducedMotionContext';

// Ensure the plugin is registered
gsap.registerPlugin(Observer);

// Mouse context type
type MousePosition = {
  x: number; // pageX
  y: number; // pageY
  clientX: number; // viewport X
  clientY: number; // viewport Y
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  event: MouseEvent | null;
};

interface MouseContextType {
  getPosition: () => MousePosition;
  isPressed: boolean;
  isDragging: boolean;
}

const MouseContext = createContext<MouseContextType | undefined>(undefined);

export const MouseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { prefersReducedMotion } = useReducedMotion();
  // Use refs for position, only state for pressed/dragged
  const positionRef = useRef<MousePosition & { hasMouseMoved?: boolean }>({
    x: 0,
    y: 0,
    clientX: 0,
    clientY: 0,
    deltaX: 0,
    deltaY: 0,
    velocityX: 0,
    velocityY: 0,
    event: null,
    hasMouseMoved: false,
  });
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Stable getPosition function
  const getPosition = useCallback(() => positionRef.current, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const observer = Observer.create({
      target: window,
      type: 'pointer, wheel, touch, scroll',
      onMove: (self) => {
        const event = self.event instanceof MouseEvent ? self.event : null;
        positionRef.current = {
          x: event ? event.pageX : self.x,
          y: event ? event.pageY : self.y,
          clientX: event ? event.clientX : 0,
          clientY: event ? event.clientY : 0,
          deltaX: self.deltaX,
          deltaY: self.deltaY,
          velocityX: self.velocityX,
          velocityY: self.velocityY,
          event,
          hasMouseMoved: true,
        };
      },
      onPress: () => {
        setIsPressed(true);
      },
      onRelease: () => {
        setIsPressed(false);
        setIsDragging(false);
      },
      onDragStart: () => {
        setIsDragging(true);
      },
      onDragEnd: () => {
        setIsDragging(false);
      },
      onWheel: (self) => {
        const event = self.event instanceof MouseEvent ? self.event : null;
        positionRef.current = {
          x: event ? event.pageX : self.x,
          y: event ? event.pageY : self.y,
          clientX: event ? event.clientX : 0,
          clientY: event ? event.clientY : 0,
          deltaX: self.deltaX,
          deltaY: self.deltaY,
          velocityX: self.velocityX,
          velocityY: self.velocityY,
          event,
          hasMouseMoved: true,
        };
      },
    });

    return () => {
      observer.kill(); // Cleanup on unmount
    };
  }, [prefersReducedMotion]);

  // Add scroll/resize listeners to update position
  useEffect(() => {
    const updatePositionOnScrollOrResize = () => {
      const last = positionRef.current;
      // Only update if we have a last known clientX/clientY and mouse has moved
      if (
        last.hasMouseMoved &&
        last.clientX !== undefined &&
        last.clientY !== undefined &&
        (last.clientX !== 0 || last.clientY !== 0)
      ) {
        positionRef.current = {
          ...last,
          x: last.clientX + window.scrollX,
          y: last.clientY + window.scrollY,
        };
      }
    };
    window.addEventListener('scroll', updatePositionOnScrollOrResize, {
      passive: true,
    });
    window.addEventListener('resize', updatePositionOnScrollOrResize);
    return () => {
      window.removeEventListener('scroll', updatePositionOnScrollOrResize);
      window.removeEventListener('resize', updatePositionOnScrollOrResize);
    };
  }, []);

  // Stable context value
  const contextValue = React.useMemo(
    () => ({ getPosition, isPressed, isDragging }),
    [getPosition, isPressed, isDragging]
  );

  return (
    <MouseContext.Provider value={contextValue}>
      {children}
    </MouseContext.Provider>
  );
};

export const useMouseEvent = () => {
  const context = useContext(MouseContext);
  if (!context) {
    throw new Error('useMouseEvent must be used within a MouseProvider');
  }
  return context;
};
