// backend/utils/graphFormatter.js

export const formatGraphData = (tgResults) => {
    const formattedData = {
        nodes: [],
        edges: [],
        metadata: {}
    };

    // Keep track of IDs we've already added so we don't send duplicates to React
    const seenNodes = new Set();

    // Loop through TigerGraph's nested result arrays
    tgResults.forEach(resultBlock => {
        for (const [key, value] of Object.entries(resultBlock)) {

            // 1. Extract Metadata (like community sizes or page rank scores)
            if (key.includes('@@') || key === 'sizes') {
                formattedData.metadata[key] = value;
                continue;
            }

            // 2. Extract Nodes and Edges
            if (Array.isArray(value)) {
                value.forEach(item => {
                    // Is it a Node (Vertex)?
                    if (item.v_id && item.v_type) {
                        if (!seenNodes.has(item.v_id)) {
                            formattedData.nodes.push({
                                id: item.v_id,
                                type: item.v_type,
                                ...item.attributes // Flatten the attributes right into the node
                            });
                            seenNodes.add(item.v_id);
                        }
                    }
                    // Is it an Edge?
                    else if (item.from_id && item.to_id) {
                        formattedData.edges.push({
                            source: item.from_id,
                            target: item.to_id,
                            type: item.e_type,
                            ...item.attributes
                        });
                    }
                });
            }
        }
    });

    return formattedData;
};