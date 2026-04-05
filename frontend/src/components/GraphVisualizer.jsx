import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

const GraphVisualizer = ({ data, onNodeSelect,isPredictiveMode }) => {
    const graphRef = useRef();
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // 1. Auto-Resize Canvas
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
            }
        };
        const timeoutId = setTimeout(updateDimensions, 100); 
        window.addEventListener('resize', updateDimensions);
        return () => { clearTimeout(timeoutId); window.removeEventListener('resize', updateDimensions); };
    }, [data]);

    // 2. ULTRA-SAFE Data Parser (This creates graphData)
    const { graphData, debugInfo } = useMemo(() => {
        if (!data || !data.nodes || data.nodes.length === 0) {
            return { graphData: null, debugInfo: "NO DATA RECEIVED" };
        }

        try {
            const nodes = data.nodes.map(n => ({
                id: String(n.id || n.v_id), 
                label: n.type || n.v_type || 'Unknown',
                isFraud: n.attributes?.is_fraud === 1 || n.compliance_status === "REDACTED_PCI_DSS",
                val: 5, 
                ...n
            }));

            const validNodeIds = new Set(nodes.map(n => n.id));

            // --- THE FIX: We MUST define links BEFORE we loop through them! ---
            const rawLinks = data.edges.map(e => ({
                source: String(e.source_id || e.from_id), 
                target: String(e.target_id || e.to_id),
                type: e.edge_type || e.e_type
            }));

            const links = rawLinks.filter(link => validNodeIds.has(link.source) && validNodeIds.has(link.target));

            // 3. Build the Network Map (Who is connected to who?)
            const crossLinked = {};
            nodes.forEach(node => { crossLinked[node.id] = new Set(); });
            links.forEach(link => {
                if (crossLinked[link.source] && crossLinked[link.target]) {
                    crossLinked[link.source].add(link.target);
                    crossLinked[link.target].add(link.source);
                }
            });

            // --- THE MINORITY REPORT ALGORITHM ---
            // 4. Find all safe nodes that are exactly 1-hop from a compromised node
            const atRiskIds = new Set();
            nodes.filter(n => n.isFraud).forEach(fraudNode => {
                if (crossLinked[fraudNode.id]) {
                    crossLinked[fraudNode.id].forEach(neighborId => {
                        atRiskIds.add(neighborId);
                    });
                }
            });

            // Apply the risk tag to the nodes
            nodes.forEach(n => {
                // It is only "At Risk" if it isn't already compromised or frozen!
                if (atRiskIds.has(n.id) && !n.isFraud && !n.isQuarantined) {
                    n.isAtRisk = true;
                }
            });

            return { 
                graphData: { nodes, links }, 
                crossLinkedNodes: crossLinked,
                debugInfo: `NODES: ${nodes.length} | VALID EDGES: ${links.length} | PREDICTIVE RISKS: ${atRiskIds.size}` 
            };

        } catch (error) {
            return { graphData: null, debugInfo: `PARSE ERROR: ${error.message}` };
        }
    }, [data]);

    // 3. PHYSICS STABILIZER (Moved HERE, so graphData actually exists!)
    useEffect(() => {
        if (graphRef.current && graphData) {
            // Lower magnetic repulsion
            graphRef.current.d3Force('charge').strength(-15);
            // Crank up central gravity so nodes don't fly away
            const centerForce = graphRef.current.d3Force('center');
            if (centerForce) {
                centerForce.strength(0.2); 
            }
        }
    }, [graphData]);

    // 4. Standby Screen
    if (!graphData) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[#010409]">
                <div className="w-40 h-40 border border-cyan-500/10 rounded-full flex items-center justify-center relative mb-4">
                   <div className="absolute inset-0 border-2 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                   <div className="absolute inset-4 border border-b-cyan-500 border-r-transparent border-t-transparent border-l-transparent rounded-full animate-[spin_4s_reverse_infinite]"></div>
                   <span className="text-cyan-800 text-[10px] tracking-widest font-bold">STANDBY</span>
                </div>
                <span className="text-slate-500 text-[10px] tracking-widest uppercase mt-4">{debugInfo || "WAITING FOR DATA..."}</span>
            </div>
        );
    }

    // 5. Main 3D Render
    return (
        <div ref={containerRef} className="h-full w-full overflow-hidden bg-[#010409] relative">
            <div className="absolute top-2 left-2 z-50 bg-black/80 border border-cyan-900 p-2 rounded text-[10px] font-mono text-green-400 pointer-events-none">
                SYS.DIAGNOSTIC: {debugInfo}
            </div>

            <ForceGraph3D
                ref={graphRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                backgroundColor="#010409"
                
                nodeRelSize={6}
                nodeResolution={16}
                // Update Node Colors
                nodeColor={node => {
                    if (node.isQuarantined) return '#475569'; // Frozen Rock
                    if (node.isFraud) return '#ef4444'; // Critical Red
                    // If Predictive Mode is ON, paint the at-risk nodes Warning Yellow!
                    if (isPredictiveMode && node.isAtRisk) return '#eab308'; 
                    
                    return '#32CD32'; // Standard Green 
                }}
                
                linkWidth={1}
                linkColor={() => 'rgba(6, 182, 212, 0.2)'}
                
                linkDirectionalParticleColor={link => {
                    const sourceNode = graphData.nodes.find(n => n.id === link.source.id || n.id === link.source);
                    const targetNode = graphData.nodes.find(n => n.id === link.target.id || n.id === link.target);
                    
                    if (sourceNode?.isFraud || targetNode?.isFraud) return '#ef4444';
                    if (isPredictiveMode && (sourceNode?.isAtRisk || targetNode?.isAtRisk)) return '#eab308';
                    return '#06b6d4';
                }}

                onNodeClick={(node) => {
                    onNodeSelect(node);
                    const distance = 200; 
                    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
                    graphRef.current.cameraPosition(
                        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                        node, 
                        1000
                    );
                }}
                onBackgroundClick={() => onNodeSelect(null)}
            />
        </div>
    );
};

export default GraphVisualizer;