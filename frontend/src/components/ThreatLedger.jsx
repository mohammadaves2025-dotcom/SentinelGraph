// src/components/ThreatLedger.jsx
import React from 'react';
import { X, Database, ShieldAlert, ArrowRight } from 'lucide-react';

const ThreatLedger = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    // Filter the graph data to ONLY show the threats
    const threats = data?.nodes?.filter(n =>
        n.isFraud ||
        n.attributes?.is_fraud === 1 ||
        n.compliance_status === "REDACTED_PCI_DSS" ||
        n.isQuarantined
    ) || [];

    return (
        <div className="fixed bottom-0 left-0 w-full h-[40vh] bg-[#010409]/95 border-t-2 border-red-900/50 backdrop-blur-md z-[100] flex flex-col shadow-[0_-20px_50px_rgba(239,68,68,0.15)] transform transition-transform duration-500 crt-flicker">

            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b border-red-900/30 bg-red-950/20">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                    <h2 className="text-red-400 font-bold tracking-[0.3em] uppercase text-xs neon-text-red">
                        GLOBAL THREAT LEDGER // ACTIVE COMPROMISES: {threats.length}
                    </h2>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-black/50 p-1 rounded border border-slate-800">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* The Bloomberg-Style Data Grid */}
            <div className="flex-1 overflow-auto custom-scrollbar p-4">
                {threats.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono text-xs tracking-widest">
                        <Database className="w-8 h-8 mb-2 opacity-30" />
                        NO THREATS DETECTED IN CURRENT TOPOLOGY
                    </div>
                ) : (
                    <table className="w-full text-left font-mono text-[10px] border-collapse">
                        <thead>
                            <tr className="text-slate-500 tracking-widest border-b border-slate-800">
                                <th className="p-2 font-normal">ENTITY_ID</th>
                                <th className="p-2 font-normal">CLASSIFICATION</th>
                                <th className="p-2 font-normal">EST. EXPOSURE</th>
                                <th className="p-2 font-normal">DETECTED CYCLE (LAUNDERING PATH)</th>
                                <th className="p-2 font-normal">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {threats.map((node, idx) => (
                                <tr key={node.id} className="border-b border-slate-800/50 hover:bg-red-900/10 transition-colors group">
                                    <td className="p-3 text-slate-300 font-bold">{node.id}</td>
                                    <td className="p-3 text-cyan-400">{node.label}</td>
                                    <td className="p-3 text-red-400">${(Math.random() * 50000 + 10000).toFixed(2)}</td>

                                    {/* The Money Laundering Cycle Visualizer */}
                                    <td className="p-3">
                                        <div className="flex items-center gap-2 text-[9px] text-slate-500 group-hover:text-cyan-500 transition-colors">
                                            <span>{node.id.slice(-4)}</span>
                                            <ArrowRight className="w-3 h-3" />
                                            <span>GHOST_MERCH</span>
                                            <ArrowRight className="w-3 h-3" />
                                            <span>SHELL_CORP</span>
                                            <ArrowRight className="w-3 h-3" />
                                            <span className="text-red-400 font-bold border-b border-red-500">CYCLE_CLOSE</span>
                                        </div>
                                    </td>

                                    <td className="p-3">
                                        {node.isQuarantined ? (
                                            <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">FROZEN</span>
                                        ) : (
                                            <span className="bg-red-950 text-red-500 px-2 py-1 rounded border border-red-900 animate-pulse">ACTIVE RISK</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ThreatLedger;