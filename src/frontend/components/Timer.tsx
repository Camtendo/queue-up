
import { useEffect, useState } from 'react';

interface Props {
    startTime?: Date | string;
}

export function Timer({ startTime }: Props) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!startTime) {
            setElapsed(0);
            return;
        }

        const start = new Date(startTime).getTime();

        const tick = () => {
            const now = new Date().getTime();
            setElapsed(Math.floor((now - start) / 1000));
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!startTime) return null;

    return (
        <div className="match-timer">
            {formatTime(elapsed)}
        </div>
    );
}
