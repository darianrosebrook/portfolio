'use client';
import { getMousePos } from "@/utils";
import { useState, useCallback, useEffect } from "react";

// Custom hook for mouse position
export const useMousePosition = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((ev: MouseEvent | Touch) => {
        const pos = getMousePos(ev);
        setMousePos(pos);
    }, []); // Throttle the event handler to limit updates to once every 50ms

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', (ev) => handleMouseMove(ev.touches[0]));

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleMouseMove as any);
        };
    }, [handleMouseMove]);

    return mousePos;
};
