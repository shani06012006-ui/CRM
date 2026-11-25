export type LeadStatus = 'New' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed';

export const STATUSES: LeadStatus[] = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed'];

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

export interface StatsData {
  totalLeads: number;
  openDeals: number;
  revenue: number;
  conversionRate: number;
  trends: {
    totalLeads: number;      // % change, new leads this month vs last
    openDeals: number;       // % change, open deals created this month vs last
    revenue: number;       
    conversionRate: number;  
  };
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