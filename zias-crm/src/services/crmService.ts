import axiosClient from '../api/axiosClient';
import { Lead, StatsData, CreateLeadDTO, AuthResponse, LoginCredentials } from '../interfaces';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulating API call for demo purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'fake-jwt-token-12345',
          user: { id: '1', name: 'Jane Doe', email: credentials.email, role: 'Admin' }
        });
      }, 1000);
    });
    // Real implementation:
    // const { data } = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    // return data;
  },
};

export const crmService = {
  getStats: async (): Promise<StatsData> => {
    const { data } = await axiosClient.get<StatsData>('/stats');
    return data;
  },
  
  getLeads: async (): Promise<Lead[]> => {
    // Returning mock data for UI demonstration
    return [
      { id: '1', name: 'Global Enterprises', company: 'Tech Corp', email: 'contact@global.com', phone: '123-456-7890', status: 'New', value: 45000, createdAt: new Date().toISOString() },
      { id: '2', name: 'TechSolutions Inc', company: 'Tech Solutions', email: 'info@techsol.com', phone: '987-654-3210', status: 'Qualified', value: 12000, createdAt: new Date().toISOString() },
      { id: '3', name: 'BrightWave', company: 'BrightWave LLC', email: 'hello@brightwave.com', phone: '555-123-4567', status: 'Proposal', value: 35000, createdAt: new Date().toISOString() },
    ];
    // Real implementation:
    // const { data } = await axiosClient.get<Lead[]>('/leads');
    // return data;
  },

  createLead: async (lead: CreateLeadDTO): Promise<Lead> => {
    const { data } = await axiosClient.post<Lead>('/leads', lead);
    return data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await axiosClient.delete(`/leads/${id}`);
  }
};