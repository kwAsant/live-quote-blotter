import { useState, useEffect } from 'react';

export const useTimer = (intervalMs: number = 1000): Date => {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    useEffect(() => {
        const id = setInterval(() => {
            setCurrentTime(new Date());
        }, intervalMs);

        return () => clearInterval(id);
    }, [intervalMs]);

    return currentTime;
};