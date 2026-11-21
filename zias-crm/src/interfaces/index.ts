//src/interfaces/index.ts

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
  owner: number | null;
}

export interface StatsData {
  totalLeads: number;
  openDeals: number;
  revenue: number;
  conversionRate: number;
  leadsTrend: number;
  leadsThisMonth: number;
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