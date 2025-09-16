'use client';
import { useInteraction } from '@/context';
import React, { useCallback, useEffect, useRef } from 'react';
import styles from './SlinkyCursor.module.scss';

export interface CursorSettings {
  size: number;
  laziness: number;
  stiffness: number;
}

const SlinkyCursor: React.FC = () => {
  const settings = useRef<CursorSettings>({
    size: 40,
    laziness: 4,
    stiffness: 2,
  });
  const { mouse, scroll } = useInteraction();

  // Refs for position tracking
  const pos = useRef({ x: 0, y: 0 });
  const deltaPos = useRef({ x: 0, y: 0 });

  const diff = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.hypot(x2 - x1, y2 - y1);
  };

  const pestRef = useRef<HTMLDivElement>(null);

  // Use a ref to always get the latest mouse position
  const { x, y } = mouse;
  const scrollY = scroll?.y ?? 0;

  const animate = useCallback(() => {
    if (!pestRef.current) return;
    const { x: xMouse, y: yMouse } = { x, y: y + scrollY };
    const { x: xPos, y: yPos } = pos.current;

    // Calculate deltas and new positions
    const xDelta = xMouse - xPos;
    const yDelta = yMouse - yPos;
    deltaPos.current = { x: xDelta, y: yDelta };

    // Smoothly move towards the mouse position
    pos.current = {
      x: xPos + xDelta / settings.current.laziness,
      y: yPos + yDelta / settings.current.laziness,
    };

    const pest = pestRef.current;
    if (pest) {
      const { size, stiffness } = settings.current;
      // Update position
      pest.style.top = `${pos.current.y - size / 2}px`;
      pest.style.left = `${pos.current.x - size / 2}px`;

      // Calculate rotation and stretch
      const angleDeg =
        Math.atan2(yMouse - yPos, xMouse - xPos) * (180 / Math.PI);
      const stretchWidth = size + diff(xPos, yPos, xMouse, yMouse) / stiffness;

      // Use CSS variables for styling
      pest.style.setProperty('width', `${stretchWidth}px`);
      pest.style.setProperty('transform', `rotate(${angleDeg}deg)`);
    }

    requestAnimationFrame(animate);
  }, [x, y, scrollY]);

  // Update active state based on mouse.isPressed from context
  useEffect(() => {
    const pest = pestRef.current;
    if (pest) {
      if (mouse.isPressed) {
        pest.classList.add(styles.active);
        settings.current.size = 32;
      } else {
        pest.classList.remove(styles.active);
        settings.current.size = 40;
      }
    }
  }, [mouse.isPressed]);

  useEffect(() => {
    // Start the animation loop once component mounts
    requestAnimationFrame(animate);
  }, [animate]);

  return (
    <div
      ref={pestRef}
      className={styles.pest}
      style={{ position: 'absolute', pointerEvents: 'none' }}
    ></div>
  );
};

export default SlinkyCursor;
