import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Observer } from 'gsap/Observer';
import { gsap } from 'gsap';
import { useReducedMotion } from './ReducedMotionContext';

// Ensure the plugin is registered
gsap.registerPlugin(Observer);

// interface MouseContextType extends Partial<Observer> {
//   x: number;
//   y: number;
//   deltaX: number;
//   deltaY: number;
//   velocityX: number;
//   velocityY: number;
//   isDragging: boolean;
//   isPressed: boolean;
//   event: MouseEvent | null; 
// }

const MouseContext = createContext (undefined);

export const MouseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { prefersReducedMotion } = useReducedMotion()
  const [mouseData, setMouseData] = useState ({})

  useEffect(() => {
    if (prefersReducedMotion) return;
    const observer = Observer.create({
      target: window,
      type: 'pointer, wheel, touch, scroll',
      onMove: (self) => { 
        setMouseData({
          ...self
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
      onWheel: (self) => {
        setMouseData(prev => ({
          ...prev,
          ...self
        }))
      }
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
