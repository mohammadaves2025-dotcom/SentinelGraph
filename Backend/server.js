import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fraudRouter from './routes/fraudRouter.js';
import axios from 'axios';
import { createServer } from 'http'; 
import { Server } from 'socket.io';  
import { startLivePulse } from './utils/cronEngine.js';
import morgan from 'morgan'; 
import helmet from 'helmet'; 
import rateLimit from 'express-rate-limit'; 

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// --- 🛡️ THE ENTERPRISE SHIELD ---
app.use(helmet({
    contentSecurityPolicy: false, // Required if you're serving any frontend assets or specific scripts
}));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        success: false,
        error: "🚨 Too many requests. SentinelGraph security has throttled your connection."
    }
});

app.use('/api/', apiLimiter);
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

io.on("connection", (socket) => {
    console.log(`⚡ New Investigator connected: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`💤 Investigator disconnected: ${socket.id}`);
    });
});

app.set('socketio', io);

// --- ROUTES ---
app.use('/api/fraud', fraudRouter);

async function getTigerGraphToken() {
    try {
        console.log("🔑 Requesting Savanna JWT Token...");
        const response = await axios.post(`${TG_HOST}/gsql/v1/tokens`, {
            secret: TG_SECRET
        });
        if (!response.data.error) return response.data.token;
        throw new Error(response.data.message);
    } catch (error) {
        console.error("❌ Auth Error:", error?.response?.data || error.message);
        return null;
    }
}

// app.get('/api/test-connection', async (req, res) => {
//     try {
//         const token = await getTigerGraphToken();
//         if (!token) return res.status(500).json({ error: "Could not generate TigerGraph Token." });

//         const response = await axios.get(`${TG_HOST}/restpp/graph/${TG_GRAPH}/vertices/Account?limit=3`, {
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
        
//         res.json({
//             message: "Success! The Ferrari is out of the garage.",
//             nodes: response.data.results
//         });
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch data from the graph." });
//     }
// });

// --- ROOT ROUTE (Fixes the "Cannot GET /" error) ---
app.get("/", (req, res) => {
  res.send("🟢 SentinelGraph Backend is Live on Vercel!");
});

// --- EXECUTION LOGIC ---
// Only start Cron/Socket listeners if running locally
if (!isProduction) {
    startLivePulse(io);
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
        console.log(`🚀 Local Dev Server: http://localhost:${PORT}`);
    });
}

// 🚨 VERCEL REQUIREMENT: Export the app
export default app;