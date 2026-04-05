// src/components/BootSequence.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';

const BootSequence = ({ onAccessGranted }) => {
    const [lines, setLines] = useState([]);
    const [showInput, setShowInput] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const inputRef = useRef(null);

    // The cinematic terminal sequence
    const bootSequence = [
        "INITIATING SECURE KERNEL BOOT...",
        "LOADING SENTINELGRAPH CORE MODULES [OK]",
        "ESTABLISHING ZERO-KNOWLEDGE UPLINK TO TIGERGRAPH [OK]",
        "MOUNTING AI THREAT ASSESSOR // GEMINI_LLM [OK]",
        "WARNING: UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED.",
        "PLEASE ENTER CREDENTIALS TO UNLOCK MAINFRAME."
    ];

    // Simulate the computer typing out the lines
    useEffect(() => {
        let currentLine = 0;
        const interval = setInterval(() => {
            if (currentLine < bootSequence.length) {
                setLines(prev => [...prev, bootSequence[currentLine]]);
                currentLine++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    setShowInput(true);
                    // Auto-focus the input field when it appears
                    if (inputRef.current) inputRef.current.focus();
                }, 500);
            }
        }, 600); // 600ms between each line printing

        return () => clearInterval(interval);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        // We will accept any password for the hackathon demo, but let's make it look like it's checking!
        if (password.toUpperCase() === 'ADMIN' || password !== '') {
            setLines(prev => [...prev, ">> CREDENTIALS ACCEPTED. DECRYPTING MAINFRAME..."]);
            setShowInput(false);
            
            // Wait 1.5 seconds for dramatic effect, then unlock the app
            setTimeout(() => {
                onAccessGranted();
            }, 1500);
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-[#010409] text-green-400 font-mono flex flex-col p-8 crt-flicker">
            {/* Background scanning laser */}
            <div className="absolute top-0 left-0 w-full h-2 bg-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.5)] animate-[scanline_4s_linear_infinite] pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-12 opacity-80">
                <ShieldAlert className="w-16 h-16 text-cyan-600" />
                <div>
                    <h1 className="text-2xl font-black tracking-[0.4em] text-cyan-600">SENTINEL<span className="text-cyan-800">OS</span></h1>
                    <p className="text-xs tracking-[0.3em] text-cyan-800">v4.2.0 // TERMINAL ACCESS</p>
                </div>
            </div>

            <div className="flex-1 max-w-3xl space-y-4 text-sm tracking-widest">
                {lines.map((line, idx) => (
                    <div key={idx} className="animate-[pulse_0.1s_ease-in-out]">
                        <span className="opacity-50 mr-4">[{new Date().toISOString().split('T')[1].slice(0,-1)}]</span>
                        {line}
                    </div>
                ))}

                {showInput && (
                    <form onSubmit={handleLogin} className="mt-8 flex items-center gap-4 animate-pulse">
                        <span className="text-red-500 font-bold">{">> ADMIN_PASSWORD:"}</span>
                        <input 
                            ref={inputRef}
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-none outline-none text-red-500 tracking-[0.5em] font-bold w-64 caret-red-500"
                            autoFocus
                        />
                    </form>
                )}

                {error && <div className="text-red-500 font-bold animate-bounce mt-4">ACCESS DENIED.</div>}
            </div>
        </div>
    );
};

export default BootSequence;
