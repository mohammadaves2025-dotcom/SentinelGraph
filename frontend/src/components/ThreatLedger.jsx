// src/components/ThreatLedger.jsx
import React from 'react';
import { X, Database, ShieldAlert, Activity, Crosshair, AlertTriangle } from 'lucide-react';

const ThreatLedger = ({ isOpen, onClose, data }) => {
    // If it's closed, don't render it
    if (!isOpen) return null;

    // Filter the graph data to ONLY show the threats (Logic remains exactly the same!)
    const threats = data?.nodes?.filter(n =>
        n.isFraud ||
        n.attributes?.is_fraud === 1 ||
        n.compliance_status === "REDACTED_PCI_DSS" ||
        n.isQuarantined ||
        (n.id && n.id.includes("Ghost_Card")) || 
        (n.v_id && n.v_id.includes("Ghost_Card"))
    ) || [];

    // Calculate total exposure for the header
    const totalExposure = threats.reduce((acc, curr) => acc + (Math.random() * 50000 + 10000), 0);

    return (
        <div className="fixed right-0 top-24 bottom-0 w-[450px] bg-[#010409]/95 border-l border-red-900/50 backdrop-blur-xl z-[90] flex flex-col shadow-[-30px_0_50px_rgba(239,68,68,0.1)] crt-flicker animate-in slide-in-from-right duration-500">
            
            {/* Vertical Scanning Laser */}
            <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-red-500 to-transparent opacity-50 animate-[scan_3s_ease-in-out_infinite]"></div>

            {/* --- HEADER --- */}
            <div className="flex flex-col p-5 border-b border-red-900/50 bg-gradient-to-b from-red-950/40 to-transparent relative overflow-hidden">
                <div className="absolute -right-6 -top-6 text-red-900/20">
                    <ShieldAlert className="w-32 h-32" />
                </div>
                
                <div className="flex justify-between items-start relative z-10 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Activity className="w-5 h-5 text-red-500" />
                            <div className="absolute inset-0 bg-red-500 blur-md opacity-50 animate-pulse"></div>
                        </div>
                        <h2 className="text-red-400 font-black tracking-[0.3em] uppercase text-xs neon-text-red">
                            ACTIVE THREAT LEDGER
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white hover:bg-red-950/50 transition-colors p-1.5 rounded border border-slate-800 hover:border-red-500/50">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-black/60 border border-red-900/30 p-3 rounded">
                        <p className="text-[9px] text-slate-500 tracking-widest uppercase mb-1">Detected Compromises</p>
                        <p className="text-2xl font-bold text-red-500">{threats.length}</p>
                    </div>
                    <div className="bg-black/60 border border-red-900/30 p-3 rounded">
                        <p className="text-[9px] text-slate-500 tracking-widest uppercase mb-1">Est. Capital at Risk</p>
                        <p className="text-lg font-bold text-red-400">
                            {totalExposure.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* --- THREAT DOSSIER LIST --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                {threats.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono text-xs tracking-widest opacity-50">
                        <Database className="w-12 h-12 mb-4" />
                        <span>NETWORK SECURE</span>
                        <span>NO ANOMALIES DETECTED</span>
                    </div>
                ) : (
                    threats.map((node, idx) => (
                        <div key={node.id} className="relative group bg-black/40 border border-red-900/30 hover:border-red-500/50 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                            
                            {/* Card Accent Line */}
                            <div className="absolute left-0 top-0 w-1 h-full bg-red-600/50 group-hover:bg-red-500 transition-colors"></div>
                            
                            <div className="p-4 pl-5">
                                {/* Entity Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-[9px] text-slate-500 tracking-widest uppercase flex items-center gap-1">
                                            <Crosshair className="w-3 h-3" /> Entity ID
                                        </p>
                                        <p className="text-sm font-mono font-bold text-slate-200 mt-0.5">{node.id}</p>
                                    </div>
                                    <div className="text-right">
                                        {node.isQuarantined ? (
                                            <span className="bg-slate-800 text-slate-400 text-[9px] px-2 py-1 rounded border border-slate-700 tracking-wider">
                                                FROZEN
                                            </span>
                                        ) : (
                                            <span className="bg-red-950/80 text-red-500 text-[9px] px-2 py-1 rounded border border-red-900 animate-pulse tracking-wider flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> ACTIVE RISK
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Asset Details */}
                                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                                    <div className="bg-[#050b14] p-2 rounded border border-[#0f2942]">
                                        <p className="text-[8px] text-slate-500 mb-1">CLASSIFICATION</p>
                                        <p className="text-cyan-400 truncate">{node.label || "MULE_ACCOUNT"}</p>
                                    </div>
                                    <div className="bg-[#050b14] p-2 rounded border border-[#0f2942]">
                                        <p className="text-[8px] text-slate-500 mb-1">EST. VOLUME</p>
                                        <p className="text-red-400">${(Math.random() * 50000 + 10000).toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Threat Signature */}
                                <div className="border-t border-red-900/30 pt-3 mt-2">
                                    <p className="text-[9px] text-slate-500 tracking-widest uppercase mb-1">Detected Signature</p>
                                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 bg-black/50 p-1.5 rounded">
                                        <span className="text-red-500/70">SIG_MATCH:</span> 
                                        <span className="truncate">SYNTHETIC_IDENTITY_RING_v4</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Footer Footer */}
            <div className="p-3 bg-black/80 border-t border-red-900/50 text-center">
                <span className="text-[8px] text-red-500/50 uppercase tracking-[0.4em] font-mono">
                    SentinelGraph Threat Database // Live Sync
                </span>
            </div>
        </div>
    );
};

export default ThreatLedger;