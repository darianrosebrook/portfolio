// Custom throttle function
export const throttle = (func: (...args: any[]) => void, limit: number) => {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}; 