/**
 * Centralized configuration management for environment variables.
 * This module reads variables directly from Vite's `import.meta.env` object.
 *
 * Vite automatically loads variables from `.env` files AND the shell environment
 * (for variables prefixed with VITE_) into `import.meta.env`. This file
 * simplifies access to them and removes the need for complex fallbacks.
 */

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Derived configuration
export const USE_REAL_API = !!API_BASE_URL;
