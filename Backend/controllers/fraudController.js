import 'dotenv/config';
import axios from 'axios';

const TG_HOST = (process.env.TG_HOST || "").trim().replace(/\/$/, '');
const TG_GRAPH = (process.env.TG_FRAUD_GRAPH || "").trim();
const TG_SECRET = (process.env.TG_FRAUD_SECRET || "").trim();
import { formatGraphData } from '../utils/graphFormatter.js';
import { generateThreatAssessment } from '../utils/aiInvestigator.js';
import { sendRedAlertEmail } from '../utils/emailService.js';
import  appCache  from '../utils/cacheService.js';
import { generateFraudPDF } from '../utils/pdfGenerator.js';



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
        const aiReport = await generateThreatAssessment(cleanData, algorithmName);

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

        // TigerGraph nests the actual data inside response.data.results
        res.json({
            success: true,
            algorithm: algorithmName,
            ai_threat_assessment: aiReport,
            data: cleanData
        });

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