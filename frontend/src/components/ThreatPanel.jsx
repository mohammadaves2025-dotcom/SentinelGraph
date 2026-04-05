import React, { useMemo } from 'react';
import { BrainCircuit, ShieldAlert, Target } from 'lucide-react';

const ThreatPanel = ({ rawReport }) => {

    // --- THE AI PARSER ENGINE ---
    // We analyze the raw Gemini text to extract structured financial intelligence
    const intel = useMemo(() => {
        if (!rawReport) return null;

        const lowerReport = rawReport.toLowerCase();

        // 1. Calculate Confidence Score based on keyword density from the AI
        let score = 45; // Base score just for getting flagged
        if (lowerReport.includes("fraud")) score += 20;
        if (lowerReport.includes("high risk") || lowerReport.includes("critical")) score += 20;
        if (lowerReport.includes("money laundering")) score += 10;
        if (lowerReport.includes("quarantine") || lowerReport.includes("freeze")) score += 4;
        const confidenceScore = Math.min(score, 99); // Max out at 99%

        // 2. Extract AML Typology Tags automatically
        const tags = [];
        if (lowerReport.includes("smurf") || lowerReport.includes("small transaction")) tags.push("SMURFING");
        if (lowerReport.includes("ring") || lowerReport.includes("circular")) tags.push("CIRCULAR ROUTING");
        if (lowerReport.includes("synthetic") || lowerReport.includes("ghost")) tags.push("SYNTHETIC ID");
        if (tags.length === 0 && rawReport.length > 50) tags.push("ANOMALOUS CLUSTER");

        return { confidenceScore, tags };
    }, [rawReport]);

    // If there is no report yet, show the Standby screen
    if (!intel) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-[10px] tracking-widest text-center">
                <BrainCircuit className="w-8 h-8 mb-4 opacity-50" />
                {">> SYSTEM SECURE."}<br />{">> WAITING FOR DATA INGESTION..."}
            </div>
        );
    }

    const isCritical = intel.confidenceScore > 75;

    return (
        <div className="h-full flex flex-col font-mono">
            {/* Intel Metrics Header */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-[#050b14] border border-[#0f2942] rounded p-3 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">AI Confidence</span>
                    <span className={`text-3xl font-black ${isCritical ? 'text-red-500 neon-text-red' : 'text-cyan-400'}`}>
                        {intel.confidenceScore}%
                    </span>
                </div>
                <div className="bg-[#050b14] border border-[#0f2942] rounded p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Action Protocol</span>
                    <span className={`text-xs font-bold ${isCritical ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                        {isCritical ? 'IMMEDIATE FREEZE' : 'MONITOR ACTIVITY'}
                    </span>
                </div>
            </div>

            {/* Typology Tags */}
            <div className="mb-4">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Detected AML Typologies
                </span>
                <div className="flex flex-wrap gap-2">
                    {intel.tags.map(tag => (
                        <span key={tag} className={`px-2 py-1 rounded text-[10px] tracking-widest font-bold ${isCritical ? 'bg-red-950/40 border border-red-900 text-red-400' : 'bg-cyan-950/40 border border-cyan-900 text-cyan-400'
                            }`}>
                            [{tag}]
                        </span>
                    ))}
                </div>
            </div>

            {/* Raw AI Briefing */}
            <div className="flex-1 flex flex-col overflow-hidden mt-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <ShieldAlert className="w-3 h-3" /> Raw Threat Briefing
                </span>
                <div className="flex-1 overflow-y-auto custom-scrollbar text-[11px] leading-relaxed text-slate-300 pr-2 pb-2">
                    {rawReport}

                </div>
                
            </div>
        </div>
    );
};

export default ThreatPanel;
