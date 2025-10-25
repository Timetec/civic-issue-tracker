// --- SINGLE LOCATION FOR API KEYS ---
// If your .env file is not working in your preview environment,
// you can paste your API keys directly into the fallback strings below.
// IMPORTANT: Remember to remove them before committing your code.

export const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || "PASTE_YOUR_GOOGLE_MAPS_API_KEY_HERE";
export const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || "PASTE_YOUR_GEMINI_API_KEY_HERE";

// Sanitize the base URL to remove any trailing slashes, preventing double-slash issues in API calls.
export const API_BASE_URL = (process.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// Derived configuration
export const USE_REAL_API = !!API_BASE_URL;