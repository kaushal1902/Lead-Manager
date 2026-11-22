// Read backend URL from environment (e.g. https://lead-manager-api.onrender.com).
// Defaults to '/api' in local development (proxied by Vite to localhost:5000).
const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

function resolveApiBase(url?: string): string {
  if (!url) return '/api';
  const clean = url.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export const API_BASE = resolveApiBase(rawApiUrl);
