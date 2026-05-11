import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
    start?: number;
    end: number;
    duration?: number;
    decimals?: number;
    separator?: string;
    prefix?: string;
    suffix?: string;
    className?: string;
}

/**
 * A lightweight CountUp component that uses requestAnimationFrame to animate
 * a number from `start` to `end`. This replaces `react-countup` which ships
 * only a CJS build that breaks ESM interop in Vite 8 + React 19.
 */
const CountUp: React.FC<CountUpProps> = ({
    start = 0,
    end,
    duration = 2,
    decimals = 0,
    separator = '',
    prefix = '',
    suffix = '',
    className,
}) => {
    const [value, setValue] = useState(start);
    const rafRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const startVal = start;
        const totalDuration = duration * 1000;

        const step = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / totalDuration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(startVal + (end - startVal) * eased);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        };

        rafRef.current = requestAnimationFrame(step);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            startTimeRef.current = null;
        };
    }, [end, start, duration]);

    const formatValue = (num: number): string => {
        const fixed = num.toFixed(decimals);
        if (separator) {
            const parts = fixed.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
            return parts.join('.');
        }
        return fixed;
    };

    return <span className={className}>{prefix}{formatValue(value)}{suffix}</span>;
};

export default CountUp;
