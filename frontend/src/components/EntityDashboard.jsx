// src/components/EntityDashboard.jsx
import React from 'react';
import { X, AlertTriangle, Activity, Database, Fingerprint, ShieldBan } from 'lucide-react';
import { engageKillSwitch } from '../services/api'; // We'll use your real kill switch!

const EntityDashboard = ({ node, onClose , onQuarantine}) => {
    if (!node) return null;

    const isCritical = node.isFraud;
    const themeColor = isCritical ? 'red' : 'cyan';
    const borderColor = isCritical ? 'border-red-500/50' : 'border-cyan-500/50';
    const bgGlow = isCritical ? 'bg-red-950/20' : 'bg-cyan-950/20';
    const textGlow = isCritical ? 'neon-text-red text-red-400' : 'neon-text-cyan text-cyan-400';

    // Simulate some financial metrics based on the ID for the demo flex
    const exposureUsd = (Math.random() * 14000 + 1000).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const velocity = Math.floor(Math.random() * 40 + 5);

    const handleQuarantine = async () => {
        const confirm = window.confirm(`ENTERPRISE OVERRIDE: Quarantine Asset ${node.id}?`);
        if (confirm) {
            try {
                await engageKillSwitch(node.label, node.id.replace(/-XXXX-XXXX-/g, '')); 
                alert("ASSET FROZEN. Network quarantine successful.");
                
                // 👈 TRIGGER THE VISUAL KILL SWITCH!
                onQuarantine(node.id); 
                
                onClose();
            } catch (err) {
                alert("Failed to engage quarantine.");
            }
        }
    };

    return (
        <div className={`fixed top-0 right-0 h-screen w-[450px] glass-panel border-l ${borderColor} z-[100] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)]`}>
            
            {/* Top Scanning Line */}
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-${themeColor}-400 to-transparent opacity-70`}></div>

            {/* HEADER */}
            <div className={`p-6 border-b border-slate-800 ${bgGlow} flex justify-between items-start relative overflow-hidden`}>
                <div className={`absolute -right-10 -top-10 opacity-10 text-${themeColor}-500`}>
                    <Fingerprint className="w-40 h-40" />
                </div>
                
                <div className="relative z-10">
                    <h2 className={`${textGlow} font-black tracking-[0.3em] uppercase text-sm mb-1`}>
                        ASSET DOSSIER // {node.label}
                    </h2>
                    <p className="text-slate-400 font-mono text-xs tracking-widest bg-black/50 px-2 py-1 rounded inline-block border border-slate-800">
                        ID: {node.id}
                    </p>
                </div>
                
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors z-10 relative bg-black/50 p-2 rounded-full border border-slate-800 hover:border-slate-500">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* SCROLLING DATA BODY */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono custom-scrollbar">
                
                {/* 1. Threat Status */}
                <div className="flex items-center justify-between p-4 border border-slate-700 bg-black/40 rounded-lg">
                    <div className="flex items-center gap-3">
                        {isCritical ? <AlertTriangle className="text-red-500 animate-pulse" /> : <Activity className="text-cyan-500" />}
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">AML System Status</p>
                            <p className={`font-bold tracking-widest ${isCritical ? 'text-red-500' : 'text-green-500'}`}>
                                {isCritical ? 'CRITICAL RISK DETECTED' : 'CLEARED BY KYC'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Financial Metrics */}
                <div>
                    <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Database className="w-3 h-3" /> Financial Exposure
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Total Vol at Risk</p>
                            <p className="text-lg font-bold text-slate-200">{exposureUsd}</p>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Tx Velocity (1H)</p>
                            <p className="text-lg font-bold text-slate-200">{velocity} <span className="text-xs text-slate-500">ops/min</span></p>
                        </div>
                    </div>
                </div>

                {/* 3. Raw Database Schema */}
                <div>
                    <h3 className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Database className="w-3 h-3" /> TigerGraph Attributes
                    </h3>
                    <div className="bg-[#050b14] border border-[#0f2942] rounded p-4 space-y-2 text-[11px]">
                        <div className="flex justify-between border-b border-slate-800/50 pb-2">
                            <span className="text-slate-500">COMPLIANCE</span>
                            <span className="text-green-400">{node.compliance_status || 'STANDARD'}</span>
                        </div>
                        {node.attributes && Object.entries(node.attributes).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                                <span className="text-slate-500 uppercase">{key}</span>
                                <span className="text-cyan-300">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Intelligence Briefing */}
                {isCritical && (
                    <div className="bg-red-950/20 border border-red-900/50 rounded p-4">
                        <h3 className="text-[10px] text-red-500 uppercase tracking-widest mb-2 font-bold">AI Deep Packet Analysis</h3>
                        <p className="text-xs leading-relaxed text-red-200/80">
                            Entity exhibits high-density edge clustering characteristic of cross-border smurfing. Synthetic identity protocols detected. Immediate freeze of associated merchant routing accounts is mandated under FINRA Rule 3310.
                        </p>
                    </div>
                )}
            </div>

            {/* ACTION FOOTER */}
            <div className="p-6 border-t border-slate-800 bg-[#010409]">
                <button 
                    onClick={handleQuarantine}
                    className={`w-full py-3 rounded font-bold tracking-[0.2em] text-xs flex items-center justify-center gap-2 transition-all ${
                        isCritical 
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                    disabled={!isCritical}
                >
                    <ShieldBan className="w-4 h-4" />
                    {isCritical ? 'ENGAGE ASSET FREEZE' : 'NO THREAT DETECTED'}
                </button>
            </div>

        </div>
    );
};

export default EntityDashboard;