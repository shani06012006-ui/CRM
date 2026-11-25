export type LeadStatus = 'New' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed';

export const STATUSES: LeadStatus[] = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed'];

export type NoteKind = 'note' | 'call' | 'email' | 'meeting';

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  name: string;
  role: string;
}

export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  value: number;
  created_at: string;
  closed_at: string | null;
  owner: number | null;
}

export interface Activity {
  id: number;
  action: 'created' | 'updated' | 'status_changed' | 'deleted';
  description: string;
  lead_name: string;
  lead: number | null;
  created_at: string;
}

export interface Note {
  id: number;
  lead: number;
  kind: NoteKind;
  body: string;
  created_at: string;
}

export interface Task {
  id: number;
  lead: number;
  title: string;
  due_date: string | null; // YYYY-MM-DD
  done: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface StatsData {
  totalLeads: number;
  openDeals: number;
  revenue: number;
  conversionRate: number;
  trends: {
    totalLeads: number;
    openDeals: number;
    revenue: number;
    conversionRate: number;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LeadPage extends PaginatedResponse<Lead> {
  total_value: number;
}

export interface LeadQuery {
  page?: number;
  page_size?: number;
  q?: string;
  status?: LeadStatus | '';
  ordering?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateLeadDTO {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  value: number;
}