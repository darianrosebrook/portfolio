import { useState, useEffect } from 'react';

export const useScrollPosition = (elementRef) => {
    const [relativePosition, setRelativePosition] = useState({ percentFromMiddle: 0 });

    useEffect(() => {
        if (!elementRef?.current) return;

        const calculatePosition = () => {
            const rect = elementRef.current.getBoundingClientRect();
            const viewportMiddlePosition = window.visualViewport.offsetTop + window.visualViewport.height / 2; // Middle of the viewport
            const elementMiddlePosition = rect.top + rect.height / 2; // Middle of the element

            const position =  (elementMiddlePosition - viewportMiddlePosition) / window.visualViewport.height 
            const percentFromMiddle = Math.min(1, Math.max(-1, position)); // Clamp between -1 and 1
            setRelativePosition({
                percentFromMiddle,
            });
        };
        calculatePosition(); // Initial calculation
        window.addEventListener('scroll', calculatePosition);
        window.addEventListener('resize', calculatePosition);

        return () => {
            window.removeEventListener('scroll', calculatePosition);
            window.removeEventListener('resize', calculatePosition);
        };
    }, [elementRef]);

    return relativePosition.percentFromMiddle;
};
