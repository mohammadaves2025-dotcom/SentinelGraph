import 'dotenv/config';
import axios from 'axios';

const TG_HOST = (process.env.TG_HOST || "").trim().replace(/\/$/, '');
const TG_GRAPH = (process.env.TG_FRAUD_GRAPH || "").trim();
const TG_SECRET = (process.env.TG_FRAUD_SECRET || "").trim();
import { formatGraphData } from '../utils/graphFormatter.js';
import { generateThreatAssessment } from '../utils/aiInvestigator.js';
import { sendRedAlertEmail } from '../utils/emailService.js';
import appCache from '../utils/cacheService.js';
import { generateFraudPDF } from '../utils/pdfGenerator.js';
import auditLogger from '../utils/auditLogger.js';
import { sendDiscordAlert } from '../utils/webhookService.js';
import { applyZeroKnowledgeMask } from '../utils/dataMasker.js';




// --- NEW: Token Generator Helper ---
async function getTigerGraphToken() {
    try {
        const response = await axios.post(`${TG_HOST}/gsql/v1/tokens`, {
            secret: TG_SECRET
        });
        if (!response.data.error) {
            return response.data.token;
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        throw new Error("Could not generate auth token: " + (error?.response?.data?.message || error.message));
    }
}



// 1. Health Check
export const pingController = (req, res) => {
    res.json({ message: "🟢 Fraud Controller is successfully wired to the Router!" });
};





// 2. The Dynamic GDS Execution Engine
export const runFraudAlgorithm = async (req, res) => {
    try {
        // Grab the algorithm name from the URL path
        const { algorithmName } = req.params;
        const queryParams = req.query;

        // --- 🕒 THE TIME WARP CHECK ---
        // Create a unique key based on the algorithm and the specific parameters
        const cacheKey = `${algorithmName}_${JSON.stringify(queryParams)}`;
        const cachedResponse = appCache.get(cacheKey);

        if (cachedResponse) {
            console.log(`⚡ [CACHE HIT] Serving ${algorithmName} from Memory (0ms DB Latency)`);
            return res.json(cachedResponse);
        }
        auditLogger.info(`ALGORITHM EXECUTED: ${algorithmName} run by automated system/user.`);
        // ------------------------------

        console.log(`🧠 Preparing to execute: ${algorithmName}`);

        // STEP 1: Generate a fresh token right before we ask for the data
        const token = await getTigerGraphToken();

        // STEP 2: Execute the algorithm with the fresh token
        const url = `${TG_HOST}/restpp/query/${TG_GRAPH}/${algorithmName}`;

        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: queryParams
        });

        console.log(`✅ Success! Returning data for ${algorithmName}`);

        const cleanData = formatGraphData(response.data.results);

        // --- 🛡️ NEW: ZERO-KNOWLEDGE COMPLIANCE MASK ---
        const securedData = applyZeroKnowledgeMask(cleanData);
        // -----------------------------------------------

        // Now we pass the SECURED data to the AI, so the AI never sees real card numbers!
        const aiReport = await generateThreatAssessment(securedData, algorithmName);

        // --- NEW: BROADCAST THE ALERT TO ALL CONNECTED DASHBOARDS ---
        const io = req.app.get('socketio');
        io.emit('fraud_alert', {
            alertType: "HIGH_RISK_DETECTED",
            algorithm: algorithmName,
            timestamp: new Date().toISOString()
        });
        // --- NEW: FIRE THE RED ALERT EMAIL ---
        // Change this to your own email address to test it!
        // During the hackathon, you can change this to the judge's email.
        const targetInbox = "test@gmail.com";
        sendRedAlertEmail(targetInbox, algorithmName, aiReport);
        // -------------------------------------


        // --- NEW: FIRE THE DISCORD WEBHOOK ---
        sendDiscordAlert(algorithmName, aiReport);
        // -------------------------------------


        // Prepare the final payload
        const finalPayload = {
            success: true,
            algorithm: algorithmName,
            ai_threat_assessment: aiReport,
            data: securedData
        };

        // --- 💾 SMART CACHE LOGIC ---
        // ONLY save to the Time Warp if the real AI successfully wrote a report!
        // If the failsafe engaged, we leave the cache empty so it tries the AI again next time.
        if (!aiReport.includes("[FAILSAFE ENGAGED]")) {
            appCache.set(cacheKey, finalPayload);
            console.log("💾 Real AI Report safely stored in Time Warp Cache.");
        } else {
            console.log("⚠️ Failsafe active. Bypassing cache to retry AI on next ping.");
        }
        // --------------------------------

        res.json(finalPayload);

        // // TigerGraph nests the actual data inside response.data.results
        // res.json({
        //     success: true,
        //     algorithm: algorithmName,
        //     ai_threat_assessment: aiReport,
        //     data: cleanData
        // });

    } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message;
        console.error(`❌ Algorithm [${req.params.algorithmName}] failed:`, errorMessage);

        res.status(500).json({
            success: false,
            error: "Failed to execute fraud detection algorithm.",
            details: errorMessage
        });
    }
};

export const downloadReportController = async (req, res) => {
    try {
        const { algorithmName } = req.params;

        // 1. Get the latest data from the Cache (Time Warp)
        const cachedData = appCache.get(`${algorithmName}_{}`);

        if (!cachedData) {
            return res.status(404).send("No recent scan found. Please run a scan first.");
        }

        // 2. Generate the PDF Buffer
        const pdfBuffer = generateFraudPDF(
            algorithmName,
            cachedData.ai_threat_assessment,
            cachedData.data
        );

        // 3. Send as a downloadable file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Sentinel_Report_${algorithmName}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        res.status(500).json({ error: "Failed to generate PDF report." });
    }
};

// --- FEATURE: ACTIVE DEFENSE KILL SWITCH ---
export const quarantineNode = async (req, res) => {
    try {
        const { nodeType, nodeId } = req.params;

        auditLogger.warn(`ACTIVE DEFENSE ENGAGED: Quarantine requested for ${nodeType} - ${nodeId}`);

        const token = await getTigerGraphToken();
        const url = `${TG_HOST}/restpp/graph/${TG_GRAPH}`;

        // TigerGraph expects a specific JSON payload to update a vertex.
        // We are dynamically telling it to update this specific node and set a risk flag.
        const mutationPayload = {
            vertices: {
                [nodeType]: {
                    [nodeId]: {
                        // We use your exact schema attribute: is_fraud
                        // We pass 1 because your schema defines it as an INT
                        "is_fraud": { "value": 1 }
                    }
                }
            }
        };

        const response = await axios.post(url, mutationPayload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`✅ [KILL SWITCH ENGAGED] ${nodeId} has been locked out of the network.`);

        // Blast a message to the WebSockets so the frontend dashboard turns this node red!
        const io = req.app.get('socketio');
        io.emit('node_quarantined', {
            nodeId: nodeId,
            nodeType: nodeType,
            status: "FROZEN",
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: `Node ${nodeId} successfully quarantined in the graph database.`,
            tigergraph_response: response.data
        });

    } catch (error) {
        console.error(`❌ [ACTIVE DEFENSE] Failed to quarantine node:`, error.message);
        res.status(500).json({ error: "Failed to mutate graph database." });
    }
};

// --- FEATURE: WAR GAMES (LIVE THREAT INJECTION) ---
export const injectChaos = async (req, res) => {
    try {
        console.log("⚠️ [WAR GAMES] Initiating Synthetic Cyberattack...");
        auditLogger.warn("WAR GAMES ENGAGED: Live threat injection started by Admin.");

        // 1. Generate unique IDs for the synthetic fraud ring
        const timestamp = Date.now();
        const fakeMerchantId = `Rogue_Merchant_${timestamp}`;
        const fakeCard1 = `Ghost_Card_${timestamp}_A`;
        const fakeCard2 = `Ghost_Card_${timestamp}_B`;
        const fakeCard3 = `Ghost_Card_${timestamp}_C`;

        // 2. Construct the TigerGraph Mutation Payload
        // This creates 3 Cards, 1 Merchant, and links them all together instantly.
        const chaosPayload = {
            vertices: {
                "Card": {
                    [fakeCard1]: { "is_fraud": { "value": 0 } },
                    [fakeCard2]: { "is_fraud": { "value": 0 } },
                    [fakeCard3]: { "is_fraud": { "value": 0 } }
                },
                "Merchant": {
                    [fakeMerchantId]: { "trust_score": { "value": 0 } } // Adjust attribute based on your schema
                }
            },
            // Note: If your edge names are different in TigerGraph (e.g., 'purchased_at'), 
            // you may need to adjust the "Transaction" key below to match your schema!
            edges: {
                "Card": {
                    [fakeCard1]: { "Transaction": { "Merchant": { [fakeMerchantId]: {} } } },
                    [fakeCard2]: { "Transaction": { "Merchant": { [fakeMerchantId]: {} } } },
                    [fakeCard3]: { "Transaction": { "Merchant": { [fakeMerchantId]: {} } } }
                }
            }
        };

        const token = await getTigerGraphToken();
        const url = `${TG_HOST}/restpp/graph/${TG_GRAPH}`;

        // 3. Inject the virus into the database
        await axios.post(url, chaosPayload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("💥 [WAR GAMES] Synthetic Fraud Ring successfully injected into TigerGraph!");

        // 4. Blast the WebSockets so the frontend flashes a warning!
        const io = req.app.get('socketio');
        io.emit('system_alert', {
            type: "SIMULATION_STARTED",
            message: "War Games Active: Synthetic threat injected into the network.",
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: "War Games activated. Fraud ring injected. Awaiting autonomous patrol detection..."
        });

    } catch (error) {
        console.error("❌ [WAR GAMES] Injection failed:", error?.response?.data || error.message);
        res.status(500).json({ error: "Failed to inject synthetic threat." });
    }
};