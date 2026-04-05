// backend/utils/cronEngine.js
import cron from 'node-cron';
import axios from 'axios';

export const startLivePulse = (io) => {
    console.log("⏱️ Live Pulse Engine armed. Autonomous patrols starting...");

    // This runs every 2 minute (represented by '0 */2 * * * *' in cron syntax)
    cron.schedule('0 */2 * * * *', async () => {
        try {
            console.log("🔍 [AUTONOMOUS PATROL] Scanning graph for anomalies...");
            
            // The server pings its own API endpoint to run the WCC algorithm
            const response = await axios.get('http://localhost:5000/api/fraud/execute/tg_wcc_card');

            if (response.data.success) {
                console.log("🚨 [CRON DETECTED FRAUD] Broadcasting live alert to WebSockets!");
                
                // Blast the AI report directly to the frontend without anyone clicking a button
                io.emit('live_pulse_alert', {
                    alertType: "AUTONOMOUS_THREAT_DETECTED",
                    algorithm: "tg_wcc_card",
                    timestamp: new Date().toISOString(),
                    threat_report: response.data.ai_threat_assessment
                });
            }
        } catch (error) {
            console.error("❌ [CRON] Patrol encountered an error. Will retry in 30 seconds.");
        }
    });
};