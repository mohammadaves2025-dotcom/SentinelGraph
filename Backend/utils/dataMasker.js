// backend/utils/dataMasker.js

export const applyZeroKnowledgeMask = (graphData) => {
    // Create a deep copy
    const maskedData = JSON.parse(JSON.stringify(graphData));

    // A dictionary to remember which old IDs became which new masked IDs
    const maskMap = {};

    // 1. MASK THE NODES
    maskedData.nodes = maskedData.nodes.map(node => {
        if (node.type === 'Card' && node.id) {
            const originalIdStr = String(node.id);
            
            if (originalIdStr.length >= 10) {
                const firstFour = originalIdStr.substring(0, 4);
                const lastFour = originalIdStr.substring(originalIdStr.length - 4);
                const maskedId = `${firstFour}-XXXX-XXXX-${lastFour}`;
                
                // Save the translation in our dictionary so we can fix the edges later!
                maskMap[originalIdStr] = maskedId;
                
                node.id = maskedId;
                node.compliance_status = "REDACTED_PCI_DSS";
            }
        }
        return node;
    });

    // 2. MASK THE EDGES (This is the missing piece!)
    maskedData.edges = maskedData.edges.map(edge => {
        const sourceStr = String(edge.source_id);
        const targetStr = String(edge.target_id);

        // If the source or target ID was masked above, we must update the edge to use the new masked ID
        if (maskMap[sourceStr]) edge.source_id = maskMap[sourceStr];
        if (maskMap[targetStr]) edge.target_id = maskMap[targetStr];

        return edge;
    });

    return maskedData;
};