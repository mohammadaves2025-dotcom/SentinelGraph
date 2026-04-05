import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fraudRouter from './routes/fraudRouter.js';
import axios from 'axios';
import { createServer } from 'http'; 
import { Server } from 'socket.io';  
import { startLivePulse } from './utils/cronEngine.js';
import morgan from 'morgan'; 
import helmet from 'helmet'; // 👈 Cleaned up imports
import rateLimit from 'express-rate-limit'; 

const app = express();

// --- 🛡️ THE ENTERPRISE SHIELD ---
// 1. Helmet: Hides Express vulnerabilities from hackers
app.use(helmet());

// 2. Rate Limiter: The Anti-DDOS Bouncer
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        success: false,
        error: "🚨 Too many requests. SentinelGraph security has throttled your connection."
    }
});

// Apply the shield strictly to ALL /api/ routes!
app.use('/api/', apiLimiter);
// ---------------------------------

// 3. GLOBAL LOGGING (Morgan)
app.use(morgan('dev'));

app.use(cors());
app.use(express.json());

const TG_HOST = (process.env.TG_HOST || "").trim().replace(/\/$/, '');
const TG_GRAPH = (process.env.TG_FRAUD_GRAPH || "").trim();
const TG_SECRET = (process.env.TG_FRAUD_SECRET || "").trim();

// --- WEBSOCKET SETUP ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Listen for frontend connections
io.on("connection", (socket) => {
    console.log(`⚡ New Investigator connected to Live Stream: ${socket.id}`);
    
    socket.on("disconnect", () => {
        console.log(`💤 Investigator disconnected: ${socket.id}`);
    });
});

// We attach the 'io' instance to the Express app so our controllers can use it!
app.set('socketio', io);
// -----------------------


//ROUTES
app.use('/api/fraud', fraudRouter);

// 1. The TG 4.x Auth Generator
async function getTigerGraphToken() {
    try {
        console.log("🔑 Requesting Savanna JWT Token...");
        const response = await axios.post(`${TG_HOST}/gsql/v1/tokens`, {
            secret: TG_SECRET
        });
        
        if (!response.data.error) {
            return response.data.token;
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        console.error("❌ Auth Error:", error?.response?.data || error.message);
        return null;
    }
}

// 2. The Test Route
app.get('/api/test-connection', async (req, res) => {
    try {
        const token = await getTigerGraphToken();
        
        if (!token) {
            return res.status(500).json({ error: "Could not generate TigerGraph Token." });
        }

        console.log("✅ Token generated! Pinging database...");

        // Fetch 3 random accounts to prove the token works
        const response = await axios.get(`${TG_HOST}/restpp/graph/${TG_GRAPH}/vertices/Account?limit=3`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("🎉 SUCCESS! Express is officially talking to TigerGraph.");
        
        res.json({
            message: "Success! The Ferrari is out of the garage.",
            nodes: response.data.results
        });

    } catch (error) {
        console.error("❌ Database Query Error:", error?.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch data from the graph." });
    }
});

// --- START AUTONOMOUS ENGINE ---
startLivePulse(io);
// -------------------------------

// Start the server using httpServer.listen
httpServer.listen(5000, () => {
    console.log(`🚀 SentinelGraph Backend & Live Stream running on http://localhost:5000`);
});