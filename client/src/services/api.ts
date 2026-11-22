import type { Lead, LeadStats, LeadsFilterParams, CreateLeadInput, UpdateLeadInput, PaginationMeta } from '../types/lead';
import { getAuthToken } from './auth';
import { API_BASE } from './config';

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface GetLeadsResponse {
  leads: Lead[];
  pagination: PaginationMeta;
}

export async function getLeads(params: LeadsFilterParams = {}): Promise<GetLeadsResponse> {
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

  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch leads: ${res.statusText}`);
  }
  const json = await res.json();
  return {
    leads: json.data,
    pagination: json.pagination || {
      total: json.data?.length || 0,
      page: 1,
      limit: json.data?.length || 10,
      totalPages: 1,
    },
  };
}

export async function getLeadStats(): Promise<LeadStats> {
  const res = await fetch(`${API_BASE}/leads/stats`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch stats: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok) {
    const errorMsg =
      json.error?.details?.[0]?.message || json.error?.message || 'Failed to create lead';
    throw new Error(errorMsg);
  }
  return json.data;
}

export async function updateLead(id: string, input: UpdateLeadInput): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok) {
    const errorMsg =
      json.error?.details?.[0]?.message || json.error?.message || 'Failed to update lead';
    throw new Error(errorMsg);
  }
  return json.data;
}

export async function updateLeadStatus(id: string, status: string): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.error?.message || 'Failed to update lead status';
    throw new Error(errorMsg);
  }
  return json.data;
}

export async function deleteLead(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.error?.message || 'Failed to delete lead';
    throw new Error(errorMsg);
  }
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) {
      console.warn(`[Health Check HTTP ${res.status}] Failed to connect to ${API_BASE}/health`);
      return false;
    }
    const json = await res.json();
    return json.status === 'ok';
  } catch (err) {
    console.warn(`[Health Check Error] Cannot reach backend at ${API_BASE}/health:`, err);
    return false;
  }
}
