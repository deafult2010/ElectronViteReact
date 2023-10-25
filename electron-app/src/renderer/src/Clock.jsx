import React, { useState, useEffect } from 'react';

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="clock">
            <h1>Current Time</h1>
            <h2>{time.toLocaleTimeString()}</h2>
        </div>
    );
};

export default Clock;