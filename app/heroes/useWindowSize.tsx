'use client';
import { useState, useEffect } from "react";

// Custom hook for window size 
export const useWindowSize = () => {
    const isClient = typeof window === 'object';

    const getSize = () => ({
        width: isClient ? window.innerWidth : 0,
        height: isClient ? window.innerHeight : 0
    });

    const [winsize, setWinsize] = useState(getSize);

    useEffect(() => {
        if (!isClient) {
            return;
        }

        const handleResize = () => {
            setWinsize(getSize());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isClient]);

    return winsize;
};
