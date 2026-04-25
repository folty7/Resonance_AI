import axios from 'axios';

const GEMINI_KEY_STORAGE = 'lyra-gemini-api-key';

export const getStoredGeminiKey = () => {
    try { return localStorage.getItem(GEMINI_KEY_STORAGE) || ''; }
    catch { return ''; }
};

export const setStoredGeminiKey = (key) => {
    try {
        if (key) localStorage.setItem(GEMINI_KEY_STORAGE, key);
        else localStorage.removeItem(GEMINI_KEY_STORAGE);
    } catch { /* ignore */ }
};

export const apiClient = axios.create({
    baseURL: `http://${window.location.hostname}:8080/api`,
    withCredentials: true
});

// Attach the user's Gemini key (if they set one in Settings) on every request.
// Backend only reads it on /sort but it's harmless elsewhere.
apiClient.interceptors.request.use((config) => {
    const key = getStoredGeminiKey();
    if (key) config.headers['x-gemini-api-key'] = key;
    return config;
});
