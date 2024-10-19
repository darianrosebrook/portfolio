'use client'
import React, { useEffect, useRef } from 'react';

interface CursorSettings {
  size: number;
  laziness: number;
  stiffness: number;
}

const SlinkyCursor: React.FC = () => {
  const settings = useRef<CursorSettings>({ size: 40, laziness: 4, stiffness: 4 });
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const deltaPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pestRef = useRef<HTMLDivElement>(null);

  const animate = () => {
    const xMouse = mouse.current.x;
    const yMouse = mouse.current.y;
    const xPos = pos.current.x;
    const yPos = pos.current.y;
    const xDelta = xMouse - xPos;
    const yDelta = yMouse - yPos;

    deltaPos.current = { x: xDelta, y: yDelta };
    pos.current = { x: xPos + xDelta / settings.current.laziness, y: yPos + yDelta / settings.current.laziness };

    const pest = pestRef.current;
    if (pest) {
      const { size, stiffness } = settings.current;
      pest.style.top = `${pos.current.y - size / 2}px`;
      pest.style.left = `${pos.current.x - size / 2}px`;
      const angleDeg = Math.atan2(yMouse - yPos, xMouse - xPos) * 180 / Math.PI;
      const stretchWidth = size + diff(xPos, yPos, xMouse, yMouse) / stiffness;
      pest.style.cssText += `z-index: 9999;width: ${stretchWidth}px; height: ${size}px; transform: rotate(${angleDeg}deg);`;
    }
    requestAnimationFrame(animate);
  };

  const diff = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.hypot(x2 - x1, y2 - y1);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.pageX, y: e.pageY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', () => {
      settings.current.size = 32; // Example modification on mousedown
      if (pestRef.current) {
        pestRef.current.style.cssText += 'border-color: var(--color-border-hover); border-style: dashed;';
      }
    });
    window.addEventListener('mouseup', () => {
      settings.current.size = 40; // Reset on mouseup
      if (pestRef.current) {
        pestRef.current.style.cssText += 'border-width: 2px; border-color: var(--color-border-bold); border-style: solid;';
      }
    });

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  } );

  return <div ref={pestRef} id="pest" style={{ position: 'absolute', pointerEvents: 'none' }}><span style={{ height: `${settings.current.size}px` }}></span></div>;
};

export default SlinkyCursor;
