// Read backend URL from environment (e.g. VITE_API_URL on Vercel).
// Defaults to the live Render production backend if not explicitly overridden.
const rawApiUrl =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  'https://lead-manager-ot5b.onrender.com';

function resolveApiBase(url: string): string {
  const clean = url.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export const API_BASE = resolveApiBase(rawApiUrl);
