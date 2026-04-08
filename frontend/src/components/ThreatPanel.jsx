import React, { useMemo } from 'react';
import { BrainCircuit, ShieldAlert, Target } from 'lucide-react';

// 🚨 CHANGED: Accept graphData as a prop
const ThreatPanel = ({ rawReport, graphData }) => {

    // 🚨 ADDED: Check if there are any active fraud nodes in the current graph state
    const hasActiveThreats = useMemo(() => {
        if (!graphData || !graphData.nodes) return false;
        return graphData.nodes.some(node => node.isFraud);
    }, [graphData]);

    // --- THE AI PARSER ENGINE ---
    const intel = useMemo(() => {
        if (!rawReport) return null;

        const lowerReport = rawReport.toLowerCase();

        let score = 45;
        if (lowerReport.includes("fraud")) score += 20;
        if (lowerReport.includes("high risk") || lowerReport.includes("critical")) score += 20;
        if (lowerReport.includes("money laundering")) score += 10;
        if (lowerReport.includes("quarantine") || lowerReport.includes("freeze")) score += 4;
        const confidenceScore = Math.min(score, 99);

        const tags = [];
        if (lowerReport.includes("smurf") || lowerReport.includes("small transaction")) tags.push("SMURFING");
        if (lowerReport.includes("ring") || lowerReport.includes("circular")) tags.push("CIRCULAR ROUTING");
        if (lowerReport.includes("synthetic") || lowerReport.includes("ghost")) tags.push("SYNTHETIC ID");
        if (tags.length === 0 && rawReport.length > 50) tags.push("ANOMALOUS CLUSTER");

        return { confidenceScore, tags };
    }, [rawReport]);

    // 🚨 CHANGED: Intercept the render. If no report OR no active threats, show the Green Secure Screen.
    if (!intel || !hasActiveThreats) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-[10px] tracking-widest text-center border border-green-500/10 bg-green-950/10 rounded-sm p-4">
                <div className="text-green-500 text-lg mb-4 font-bold flex items-center gap-2 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    SYSTEM SECURE
                </div>
                <BrainCircuit className="w-8 h-8 mb-4 opacity-50 text-green-600" />
                <span className="text-green-600/70">{">> BASELINE TOPOLOGY NORMAL."}</span>
                <span className="text-green-600/70">{">> NO GDS ANOMALIES DETECTED."}</span>
            </div>
        );
    }

    // If there ARE threats, render the Gemini Analysis as normal
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