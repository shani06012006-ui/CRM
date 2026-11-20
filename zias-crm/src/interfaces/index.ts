// Core Models
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
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
  createdAt: string;
}

export interface StatsData {
  totalLeads: number;
  openDeals: number;
  revenue: number;
  conversionRate: number;
}

// API Request/Response Models
export interface LoginCredentials {
  email: string;
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

export interface ApiError {
  message: string;
  statusCode: number;
}