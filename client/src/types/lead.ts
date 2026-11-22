export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';

export type LeadSource = 'Website' | 'Referral' | 'LinkedIn' | 'Cold_Outreach' | 'Other';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes?: string | null;
}

export type UpdateLeadInput = Partial<CreateLeadInput>;

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  lost: number;
}

export interface LeadsFilterParams {
  search?: string;
  status?: LeadStatus | 'All';
  source?: LeadSource | 'All';
  sortBy?: 'createdAt' | 'name' | 'status' | 'company';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
