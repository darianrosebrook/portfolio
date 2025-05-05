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
  x: number;
  y: number;
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
  const positionRef = useRef<MousePosition>({
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    velocityX: 0,
    velocityY: 0,
    event: null,
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
        positionRef.current = {
          x: self.x,
          y: self.y,
          deltaX: self.deltaX,
          deltaY: self.deltaY,
          velocityX: self.velocityX,
          velocityY: self.velocityY,
          event: self.event instanceof MouseEvent ? self.event : null,
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
        positionRef.current = {
          x: self.x,
          y: self.y,
          deltaX: self.deltaX,
          deltaY: self.deltaY,
          velocityX: self.velocityX,
          velocityY: self.velocityY,
          event: self.event instanceof MouseEvent ? self.event : null,
        };
      },
    });

    return () => {
      observer.kill(); // Cleanup on unmount
    };
  }, [prefersReducedMotion]);

  // Stable context value
  const contextValue = React.useMemo(
    () => ({ getPosition, isPressed, isDragging }),
    [getPosition, isPressed, isDragging]
  );

  return (
    <MouseContext.Provider value={contextValue}>{children}</MouseContext.Provider>
  );
};

export const useMouseEvent = () => {
  const context = useContext(MouseContext);
  if (!context) {
    throw new Error('useMouseEvent must be used within a MouseProvider');
  }
  return context;
};
