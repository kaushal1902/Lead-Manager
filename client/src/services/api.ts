import type { Lead, LeadStats, LeadsFilterParams } from '../types/lead';

const API_BASE = '/api';

export async function getLeads(params: LeadsFilterParams = {}): Promise<Lead[]> {
  const query = new URLSearchParams();
  if (params.search && params.search.trim()) query.set('search', params.search.trim());
  if (params.status && params.status !== 'All') query.set('status', params.status);
  if (params.source && params.source !== 'All') query.set('source', params.source);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.order) query.set('order', params.order);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const queryString = query.toString();
  const url = `${API_BASE}/leads${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch leads: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function getLeadStats(): Promise<LeadStats> {
  const res = await fetch(`${API_BASE}/leads/stats`);
  if (!res.ok) {
    throw new Error(`Failed to fetch stats: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return false;
    const json = await res.json();
    return json.status === 'ok';
  } catch {
    return false;
  }
}
