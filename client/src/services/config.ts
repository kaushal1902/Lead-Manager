// Read backend URL from environment (e.g. https://lead-manager-api.onrender.com).
// Defaults to '/api' in local development (proxied by Vite to localhost:5000).
const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
export const API_BASE = rawApiUrl ? `${rawApiUrl.replace(/\/$/, '')}/api` : '/api';
