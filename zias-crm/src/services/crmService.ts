//src/services/crmService.ts

import axiosClient from '../api/axiosClient';
import { Lead, StatsData, CreateLeadDTO, AuthResponse, LoginCredentials } from '../interfaces';

export const authService = {
  login: async ({ username, password }: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<{ access: string; refresh: string }>('/auth/login/', {
      username,
      password,
    });

    localStorage.setItem('crm_token', data.access);
    localStorage.setItem('crm_refresh', data.refresh);

    return {
      token: data.access,
      user: { id: username, name: username, email: '', role: 'Admin' },
    };
  },
};

export const crmService = {
  getStats: async (): Promise<StatsData> => {
    const { data } = await axiosClient.get<StatsData>('/stats/');
    return data;
  },

  getLeads: async (): Promise<Lead[]> => {
    const { data } = await axiosClient.get<Lead[]>('/leads/');
    return data;
  },

  createLead: async (lead: CreateLeadDTO): Promise<Lead> => {
    const { data } = await axiosClient.post<Lead>('/leads/', lead);
    return data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await axiosClient.delete(`/leads/${id}/`);
  },
};

export default crmService;