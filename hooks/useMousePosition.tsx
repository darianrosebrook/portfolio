import { useCallback, useEffect,  useState } from "react";  
import { useReducedMotion } from "@/context";

interface MousePosition {
    x: number;
    y: number;
}
 

const getMousePos = (e: MouseEvent | Touch) => {
    const [x, y] = [Math.round(e.clientX), Math.round(e.clientY)];
    return {
        x,
        y
    };
};
export const useMousePosition = (): MousePosition => {
    const [mousePosition, setMouse] = useState<MousePosition>({ x: 0, y: 0 });
    const {prefersReducedMotion} = useReducedMotion();

    const handleMouseMove = useCallback((ev: MouseEvent | Touch) => {
        const pos = getMousePos(ev);
        setMouse(pos);
    }, []);

    useEffect(() => { 
        if (prefersReducedMotion) return;
        const handleTouchMove = (ev: TouchEvent) => handleMouseMove(ev.touches[0]);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, [handleMouseMove, prefersReducedMotion]);

    return mousePosition;
};