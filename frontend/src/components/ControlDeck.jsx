import React, { useState, useEffect } from 'react'; // Added useEffect
import { ShieldAlert, Download, Crosshair, Skull, Database, Eye, Clock } from 'lucide-react';
import { executeScan, triggerWarGames, getPdfDownloadUrl } from '../services/api';

const ControlDeck = ({ setGraphData, setAiReport, activeAlgorithm, defcon, setDefcon, ThreatLedger, onToggleLedger, isPredictiveMode, onTogglePredictive }) => {
    const [isScanning, setIsScanning] = useState(false);
    
    // --- CLOCK LOGIC ---
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    // -------------------

    const handleRunScan = async () => {
        setIsScanning(true);
        setAiReport(">> SECURE UPLINK ESTABLISHED.\n>> INITIATING DEEP GRAPH TRAVERSAL...\n>> WAKING AI INVESTIGATOR...");
        try {
            const result = await executeScan(activeAlgorithm);
            setGraphData(result.data);
            setAiReport(result.ai_threat_assessment);
            setDefcon(5);
        } catch (error) {
            setAiReport("❌ CRITICAL ERROR: Connection to Sentinel Mainframe severed.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleDownload = () => window.open(getPdfDownloadUrl(activeAlgorithm), '_blank');

    const handleWarGames = async () => {
        if (window.confirm("CRITICAL WARNING: OVERRIDING SAFETY PROTOCOLS. INJECT SYNTHETIC THREAT?")) {
            setDefcon(1); 
            setAiReport(">> AUTHORIZATION ACCEPTED: ADMIN_01...\n>> INJECTING PAYLOAD...");
            try {
                await triggerWarGames();
                setTimeout(async () => {
                    const result = await executeScan(activeAlgorithm);
                    setGraphData(result.data);
                    setAiReport(result.ai_threat_assessment);
                }, 2000);
            } catch (error) {
                setAiReport("❌ CHAOS INJECTION FAILED.");
                setDefcon(5);
            }
        }
    };

    return (
        <div className={`h-24 bg-[#010409] border-b-2 flex items-center justify-between px-8 relative z-50 transition-colors duration-700 ${
            defcon === 1 ? 'border-red-500/50 shadow-[0_10px_30px_rgba(239,68,68,0.1)]' : 'border-[#06b6d4]/30'
        }`}>
            {/* Top scanning laser edge */}
            <div className={`absolute top-0 left-0 w-full h-[2px] opacity-70 transition-colors duration-700 ${
                defcon === 1 ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'
            }`}></div>

            {/* Logo Area + Clock Integration */}
            <div className="flex items-center gap-5">
                <div className="relative">
                   
                </div>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black tracking-[0.25em] text-white">
                        SENTINEL<span className="text-red-500 neon-text-red">GRAPH</span>
                    </h1>
                    
                    <div className="flex items-center gap-4">
                        {/* Status Label */}
                        <span className={`text-[10px] tracking-[0.4em] uppercase font-bold transition-colors ${defcon === 1 ? 'text-red-400' : 'text-cyan-400'}`}>
                            SYS.STAT: <span className={defcon === 1 ? 'text-red-500 animate-pulse' : 'text-green-400'}>
                                {defcon === 1 ? 'LOCKDOWN' : 'ONLINE'}
                            </span>
                        </span>

                        {/* DIGITAL CLOCK */}
                        <div className="flex items-center gap-2 px-2 py-0.5 border-l border-slate-700 ml-2">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className="font-mono text-[11px] text-slate-300 tracking-widest">
                                {time.toLocaleTimeString([], { hour12: false })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-5">
                <button 
                    onClick={handleRunScan}
                    disabled={isScanning}
                    className={`relative overflow-hidden flex items-center gap-2 px-6 py-2 font-bold tracking-[0.2em] transition-all duration-300 border-2 ${
                        isScanning 
                        ? 'bg-slate-900 text-cyan-800 border-cyan-900/50' 
                        : 'bg-cyan-950/30 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                    }`}
                >
                    <Crosshair className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
                    {isScanning ? 'TRAVERSING...' : 'ENGAGE SCANNER'}
                </button>

                <div className="w-[2px] h-12 bg-slate-800 mx-2"></div> 

                <button 
                    onClick={handleWarGames}
                    className="group relative flex items-center gap-3 px-8 py-3 bg-[#0f0303] text-red-500 border-2 border-red-900/50 hover:border-red-500 hover:text-white transition-all uppercase font-bold text-sm tracking-widest"
                >
                    <Skull className={`w-5 h-5 ${defcon === 1 ? 'animate-pulse' : ''}`} />
                    WAR GAMES
                </button>

                <button 
                    onClick={onTogglePredictive}
                    className={`flex items-center gap-2 px-6 py-3 border transition-all text-xs font-bold uppercase tracking-widest ${
                        isPredictiveMode ? 'bg-yellow-950/40 text-green-500' : ' text-green-700 border-green-900 hover:border-green-500'
                    }`}
                >
                    <Eye className="w-4 h-4" />
                    INTEL
                </button>

                <button 
                    onClick={onToggleLedger}
                    className="flex items-center gap-2 px-6 py-3  text-green-700 border border-green-900 hover:border-green-500 transition-all text-xs font-bold uppercase tracking-widest"
                >
                    <Database className="w-4 h-4" />
                    LEDGER
                </button>

                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-3 bg-[#0a111a] text-slate-400 hover:text-cyan-400 border border-slate-700 transition-all text-xs font-bold uppercase"
                >
                    <Download className="w-4 h-4" />
                    LOGS
                </button>
            </div>
        </div>
    );
};

export default ControlDeck;