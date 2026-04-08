import React, { useState } from 'react';
import ControlDeck from './components/ControlDeck';
import GraphVisualizer from './components/GraphVisualizer';
import LiveFeed from './components/LiveFeed';
import EntityDashboard from './components/EntityDashboard';
import ThreatPanel from './components/ThreatPanel';
import BootSequence from './components/BootSequence';
import ThreatLedger from './components/ThreatLedger';

const HUDPanel = ({ title, children, color = "cyan", defcon }) => {
  // If we are at DEFCON 1, force everything to turn aggressive RED
  const isAlarm = defcon === 1;
  const borderColor = color === 'red' || isAlarm ? 'border-red-500' : 'border-cyan-500';
  const textColor = color === 'red' || isAlarm ? 'text-red-400 neon-text-red' : 'text-cyan-400 neon-text-cyan';
  const bgAlarm = isAlarm ? 'bg-red-950/20' : 'bg-[#010409]/60';

  return (
    <div className={`relative glass-panel flex flex-col h-full w-full transition-all duration-700 ${isAlarm ? 'shadow-[inset_0_0_50px_rgba(239,68,68,0.15)] border-red-900/50' : ''}`}>
      <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 ${borderColor} opacity-70 transition-colors duration-500`}></div>
      <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 ${borderColor} opacity-70 transition-colors duration-500`}></div>
      <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 ${borderColor} opacity-70 transition-colors duration-500`}></div>
      <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 ${borderColor} opacity-70 transition-colors duration-500`}></div>

      <div className={`px-4 py-2 border-b border-[#0f2942] ${bgAlarm} flex justify-between items-center transition-colors duration-500`}>
        <h2 className={`${textColor} text-[10px] tracking-[0.3em] uppercase font-bold flex items-center gap-2`}>
          {isAlarm && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
          {title}
        </h2>
      </div>
      <div className="flex-1 p-4 relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};

function App() {
  const [graphData, setGraphData] = useState(null);
  const [aiReport, setAiReport] = useState("");
  const [activeAlgorithm, setActiveAlgorithm] = useState("tg_wcc_account_with_weights");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isPredictiveMode, setIsPredictiveMode] = useState(false);

  // --- LOGIC UPGRADE: Global Threat Level ---
  const [defcon, setDefcon] = useState(5); // 5 is safe, 1 is under attack
  // --- LOGIC UPGRADE: Live Visual Quarantine ---
  const handleNodeQuarantine = (nodeId) => {
    setGraphData(prevData => {
      if (!prevData) return prevData;

      // Find the quarantined node and change its status to 'isQuarantined'
      return {
        ...prevData,
        nodes: prevData.nodes.map(n =>
          n.id === nodeId ? { ...n, isFraud: false, isQuarantined: true } : n
        )
      };
    });
  };

  return (
    <>
      {/* If not authenticated, lock them in the Boot Sequence! */}
      {!isAuthenticated && <BootSequence onAccessGranted={() => setIsAuthenticated(true)} />}

      <div className="min-h-screen flex flex-col crt-flicker relative overflow-hidden bg-[#010409]">

        {/* DEFCON 1: Global Visual Sirens */}
        {defcon === 1 && (
          <div className="absolute inset-0 bg-red-500/10 z-0 pointer-events-none animate-[pulse_1s_ease-in-out_infinite] shadow-[inset_0_0_200px_rgba(255,0,0,0.3)]"></div>
        )}

        <div className="global-scanline"></div>

        <ControlDeck
          setGraphData={setGraphData}
          setAiReport={setAiReport}
          activeAlgorithm={activeAlgorithm}
          defcon={defcon}
          setDefcon={setDefcon}
          onToggleLedger={() => setIsLedgerOpen(!isLedgerOpen)} // Pass it to the buttons
          isPredictiveMode={isPredictiveMode} // 👈 Pass State
          onTogglePredictive={() => setIsPredictiveMode(!isPredictiveMode)} // 👈 Pass Toggle
        />

        <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden relative z-10">

          <div className="col-span-3 h-full">
            <HUDPanel title="Live Socket Uplink // Port 5000" defcon={defcon}>
              <LiveFeed />
            </HUDPanel>
          </div>

          <div className="col-span-6 h-full">
            <HUDPanel title={`Topology Matrix // ALG: ${activeAlgorithm}`} defcon={defcon}>
              <GraphVisualizer
                data={graphData}
                onNodeSelect={setSelectedEntity}
                isPredictiveMode={isPredictiveMode} // 👈 Pass it here!
              />
            </HUDPanel>
          </div>

          <div className="col-span-3 h-full">
            {/* 🚨 CHANGED: The HUD border color now reacts to the actual graph data, not just the report text */}
            <HUDPanel
              title="Gemini Threat Analysis"
              color={graphData?.nodes?.some(n => n.isFraud) ? "red" : "cyan"}
              defcon={defcon}
            >
              {/* 🚨 CHANGED: Pass graphData as a prop */}
              <ThreatPanel rawReport={aiReport} graphData={graphData} />
            </HUDPanel>
          </div>

        </div>

        <EntityDashboard
          node={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onQuarantine={handleNodeQuarantine}
        />
        <ThreatLedger isOpen={isLedgerOpen} onClose={() => setIsLedgerOpen(false)} data={graphData} />
      </div>
    </>
  );
}

export default App;