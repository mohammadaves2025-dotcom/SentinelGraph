// src/components/LiveFeed.jsx
import React, { useEffect, useState, useRef } from 'react';
import { socket, connectSocket, disconnectSocket } from '../services/socket';

const LiveFeed = () => {
    const [logs, setLogs] = useState([
        { type: 'SYSTEM', time: new Date().toISOString(), msg: 'Initializing Sentinel Socket Uplink...' },
        { type: 'SUCCESS', time: new Date().toISOString(), msg: 'Port 5000 secured. Awaiting autonomous telemetry.' }
    ]);
    const feedEndRef = useRef(null);

    useEffect(() => {
        connectSocket();

        // Listen for AI Fraud Alerts
        socket.on('fraud_alert', (data) => {
            setLogs(prev => [...prev, { 
                type: 'CRITICAL', 
                time: data.timestamp, 
                msg: `AI DETECTED HIGH RISK: ${data.algorithm}` 
            }]);
        });

        // Listen for War Games & System events
        socket.on('system_alert', (data) => {
            setLogs(prev => [...prev, { 
                type: data.type === 'SIMULATION_STARTED' ? 'WAR_GAMES' : 'SYSTEM', 
                time: data.timestamp, 
                msg: data.message 
            }]);
        });

        return () => {
            socket.off('fraud_alert');
            socket.off('system_alert');
            disconnectSocket();
        };
    }, []);

    // Auto-scroll to the bottom when a new log arrives
    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="h-full w-full flex flex-col font-mono text-[10px] overflow-y-auto pr-2">
            {logs.map((log, index) => {
                // Color code the terminal text
                let colorClass = 'text-slate-400';
                if (log.type === 'CRITICAL') colorClass = 'text-red-500 font-bold neon-text-red';
                if (log.type === 'WAR_GAMES') colorClass = 'text-yellow-400 font-bold';
                if (log.type === 'SUCCESS') colorClass = 'text-green-400';

                const timeString = new Date(log.time).toLocaleTimeString();

                return (
                    <div key={index} className={`mb-3 tracking-widest ${colorClass}`}>
                        <span className="opacity-50 mr-2">[{timeString}]</span>
                        <span>{log.msg}</span>
                    </div>
                );
            })}
            <div ref={feedEndRef} />
        </div>
    );
};

export default LiveFeed;