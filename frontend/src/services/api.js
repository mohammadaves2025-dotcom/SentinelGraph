// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a pre-configured Axios instance
const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- THE COMMAND DICTIONARY ---

export const executeScan = async (algorithm = 'tg_wcc_account_with_weights') => {
    try {
        const response = await apiClient.get(`/fraud/execute/${algorithm}`);
        return response.data;
    } catch (error) {
        console.error("Scan Failed:", error);
        throw error;
    }
};

export const triggerWarGames = async () => {
    try {
        const response = await apiClient.post('/fraud/wargames');
        return response.data;
    } catch (error) {
        console.error("War Games Injection Failed:", error);
        throw error;
    }
};

export const engageKillSwitch = async (nodeType, nodeId) => {
    try {
        const response = await apiClient.post(`/fraud/quarantine/${nodeType}/${nodeId}`);
        return response.data;
    } catch (error) {
        console.error("Kill Switch Failed:", error);
        throw error;
    }
};

// Note: PDF download is handled slightly differently in the browser (usually via window.open or an anchor tag),
// but we store the URL generator here for clean architecture!
export const getPdfDownloadUrl = (algorithm = 'tg_wcc_account_with_weights') => {
    return `${API_URL}/api/fraud/download-report/${algorithm}`;
};