import React, { useState } from 'react';
import { ShieldAlert, Download, Crosshair, Skull ,Database ,Eye} from 'lucide-react';
import { executeScan, triggerWarGames, getPdfDownloadUrl } from '../services/api';

// Notice we added defcon and setDefcon here!
const ControlDeck = ({ setGraphData, setAiReport, activeAlgorithm, defcon, setDefcon,ThreatLedger,onToggleLedger,isPredictiveMode,onTogglePredictive }) => {
    const [isScanning, setIsScanning] = useState(false);

    const handleRunScan = async () => {
        setIsScanning(true);
        setAiReport(">> SECURE UPLINK ESTABLISHED.\n>> INITIATING DEEP GRAPH TRAVERSAL...\n>> WAKING AI INVESTIGATOR...");
        try {
            const result = await executeScan(activeAlgorithm);
            setGraphData(result.data);
            setAiReport(result.ai_threat_assessment);
            setDefcon(5); // Reset alarm if scan is clear
        } catch (error) {
            setAiReport("❌ CRITICAL ERROR: Connection to Sentinel Mainframe severed.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleDownload = () => window.open(getPdfDownloadUrl(activeAlgorithm), '_blank');

    // --- LOGIC UPGRADE: The Cinematic War Games Sequence ---
    const handleWarGames = async () => {
        if (window.confirm("CRITICAL WARNING: OVERRIDING SAFETY PROTOCOLS. INJECT SYNTHETIC THREAT?")) {
            
            // 1. TRIGGER THE GLOBAL ALARM
            setDefcon(1); 
            
            // 2. THE VISUAL HACK SEQUENCE
            setAiReport(
                ">> AUTHORIZATION ACCEPTED: ADMIN_01.\n" +
                ">> BYPASSING FIREWALL...\n" +
                ">> GENERATING SYNTHETIC FRAUD RING (GHOST_CARDS x3, ROGUE_MERCHANT x1)...\n" +
                ">> INJECTING PAYLOAD INTO TIGERGRAPH..."
            );

            try {
                // 3. FIRE THE BACKEND API
                await triggerWarGames();
                
                setAiReport(prev => prev + "\n>> PAYLOAD SUCCESSFULLY INJECTED.\n>> FORCING EMERGENCY GRAPH TRAVERSAL...");

                // 4. WAIT 2 SECONDS FOR DRAMA, THEN AUTO-PULL THE NEW GRAPH
                setTimeout(async () => {
                    const result = await executeScan(activeAlgorithm);
                    setGraphData(result.data);
                    setAiReport(result.ai_threat_assessment);
                    
                    // Keep DEFCON 1 active so the red alarm state stays on!
                }, 2000);

            } catch (error) {
                setAiReport("❌ CHAOS INJECTION FAILED. SYSTEM REBOOTING.");
                setDefcon(5);
            }
        }
    };

    // The rest of your return statement stays exactly the same...
    return (
        <div className={`h-24 bg-[#010409] border-b-2 flex items-center justify-between px-8 relative z-50 shadow-[0_10px_30px_rgba(6,182,212,0.05)] transition-colors duration-700 ${
            defcon === 1 ? 'border-red-500/50' : 'border-[#06b6d4]/30'
        }`}>
            {/* Top scanning laser edge */}
            <div className={`absolute top-0 left-0 w-full h-[2px] opacity-70 transition-colors duration-700 ${
                defcon === 1 ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'
            }`}></div>

            {/* Logo Area */}
            <div className="flex items-center gap-5">
                <div className="relative">
                    <ShieldAlert className={`w-12 h-12 transition-colors duration-500 ${
                        defcon === 1 ? 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,1)] animate-bounce' : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,1)]'
                    }`} />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black tracking-[0.25em] text-white">
                        SENTINEL<span className="text-red-500 neon-text-red">GRAPH</span>
                    </h1>
                    <span className={`text-[10px] tracking-[0.4em] uppercase font-bold transition-colors ${defcon === 1 ? 'text-red-400' : 'text-cyan-400'}`}>
                        SYS.STAT: <span className={`${defcon === 1 ? 'text-red-500 animate-pulse' : 'text-green-400 animate-pulse'}`}>
                            {defcon === 1 ? 'DEFCON 1 LOCKDOWN' : 'ONLINE'}
                        </span> // ID: ADMIN_01
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6">
                <button 
                    onClick={handleRunScan}
                    disabled={isScanning}
                    className={`relative overflow-hidden flex items-center gap-3 px-8 py-3 font-bold tracking-[0.2em] transition-all duration-300 border-2 ${
                        isScanning 
                        ? 'bg-slate-900 text-cyan-800 border-cyan-900/50' 
                        : 'bg-cyan-950/30 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:border-cyan-400'
                    }`}
                >
                    <Crosshair className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
                    {isScanning ? 'TRAVERSING GRAPH...' : 'ENGAGE SCANNER'}
                </button>

                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0a111a] text-slate-400 hover:text-cyan-400 hover:bg-[#0f1b29] border border-slate-700 hover:border-cyan-500/50 transition-all tracking-widest text-xs font-bold uppercase"
                >
                    <Download className="w-4 h-4" />
                    EXPORT LOG
                </button>

                <div className="w-[2px] h-12 bg-slate-800 mx-2"></div> 

                <button 
                    onClick={handleWarGames}
                    className="group relative flex items-center gap-3 px-8 py-3 bg-danger-stripes bg-[#0f0303] text-red-500 hover:text-white border-2 border-red-900/50 hover:border-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] font-bold tracking-[0.2em] uppercase transition-all"
                >
                    <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <Skull className={`w-5 h-5 fill-current ${defcon === 1 ? 'animate-pulse' : ''}`} />
                    WAR GAMES
                </button>
                
                    {/* --- NEW BUTTON: MINORITY REPORT ALGORITHM --- */}
                <button 
                    onClick={onTogglePredictive}
                    className={`flex items-center gap-2 px-6 py-3 border transition-all tracking-widest text-xs font-bold uppercase ${
                        isPredictiveMode 
                        ? 'bg-yellow-950/40 text-yellow-500 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
                        : 'bg-[#1a1705] text-yellow-700 hover:text-yellow-500 border-yellow-900/30 hover:border-yellow-700/50'
                    }`}
                >
                    <Eye className={`w-4 h-4 ${isPredictiveMode ? 'animate-pulse' : ''}`} />
                    PREDICTIVE INTEL
                </button>
                
                {/* --- NEW BUTTON: OPEN THREAT LEDGER --- */}
                <button 
                    onClick={onToggleLedger}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1a0505] text-red-500 hover:text-red-400 hover:bg-[#2a0808] border border-red-900/50 hover:border-red-500 transition-all tracking-widest text-xs font-bold uppercase"
                >
                    <Database className="w-4 h-4" />
                    THREAT LEDGER
                </button>

                <div className="w-[2px] h-12 bg-slate-800 mx-2"></div>
            </div>
        </div>
    );
};

export default ControlDeck;