// Live Render production backend URL
const LIVE_BACKEND_URL = 'https://lead-manager-ot5b.onrender.com/api';

function resolveApiBase(): string {
  // If in production (Vercel deployment), strictly use the live Render backend
  if (import.meta.env.PROD) {
    const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      const clean = envUrl.replace(/\/+$/, '');
      return clean.endsWith('/api') ? clean : `${clean}/api`;
    }
    return LIVE_BACKEND_URL;
  }

  // In development, respect VITE_API_URL if set, otherwise default to live backend or /api
  const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!rawApiUrl) return LIVE_BACKEND_URL;
  const clean = rawApiUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export const API_BASE = resolveApiBase();
