import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Observer } from 'gsap/Observer';
import { gsap } from 'gsap';
import { useReducedMotion } from './ReducedMotionContext';

// Ensure the plugin is registered
gsap.registerPlugin(Observer);

interface MouseContextType extends Partial<Observer> {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  isDragging: boolean;
  isPressed: boolean;
  event: PointerEvent | null;
}

const MouseContext = createContext<MouseContextType | undefined>(undefined);

export const MouseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { prefersReducedMotion } = useReducedMotion()
  const [mouseData, setMouseData] = useState<MouseContextType>({
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    velocityX: 0,
    velocityY: 0,
    isDragging: false,
    isPressed: false,
    event: null,
  });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const observer = Observer.create({
      target: window,
      type: 'pointer, wheel, touch, scroll',
      onMove: (self) => {
        const event = self.event as PointerEvent;
        setMouseData({
          x: self.x || 0,
          y: self.y || 0,
          deltaX: self.deltaX || 0,
          deltaY: self.deltaY || 0,
          velocityX: self.velocityX || 0,
          velocityY: self.velocityY || 0,
          isDragging: self.isDragging || false,
          isPressed: self.isPressed || false,
          event: event || null,
        });
      },
      onPress: () => {
        setMouseData((prev) => ({
          ...prev,
          isPressed: true,
        }));
      },
      onRelease: () => {
        setMouseData((prev) => ({
          ...prev,
          isPressed: false,
          isDragging: false,
        }));
      },
      onDragStart: () => {
        setMouseData((prev) => ({
          ...prev,
          isDragging: true,
        }));
      },
      onDragEnd: () => {
        setMouseData((prev) => ({
          ...prev,
          isDragging: false,
        }));
      },
    });

    return () => {
      observer.kill(); // Cleanup on unmount
    };
  }, [prefersReducedMotion]);

  return <MouseContext.Provider value={mouseData}>{children}</MouseContext.Provider>;
};

export const useMouseEvent = () => {
  const context = useContext(MouseContext);
  if (!context) {
    throw new Error('useMouseEvent must be used within a MouseProvider');
  }
  return context;
};
