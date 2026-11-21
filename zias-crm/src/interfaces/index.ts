//src/interfaces/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;  
  user: User;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'New' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed';
  value: number;
  created_at: string;
}

export interface StatsData {
  totalLeads: number;
  openDeals: number;
  revenue: number;
  conversionRate: number;
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
  status: Lead['status'];
  value: number;
}