// frontend/src/services/socket.js
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Initialize the socket connection
export const socket = io(API_URL, {
    autoConnect: false, // We will manually connect this when the Dashboard loads
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
        console.log("⚡ [LIVE FEED] Connecting to SentinelGraph Mainframe...");
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
        console.log("💤 [LIVE FEED] Disconnected from Mainframe.");
    }
};