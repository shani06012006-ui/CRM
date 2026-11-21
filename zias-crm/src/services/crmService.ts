//src/services/crmService.ts

import axiosClient from '../api/axiosClient';
import { Lead, StatsData, CreateLeadDTO, User } from '../interfaces';

export const getApiError = (err: any): string => {
  if (!err?.response) return "Can't reach the server. Is Django running on port 8000?";
  const data = err.response.data;
  if (data?.detail) return data.detail;
  if (data && typeof data === 'object') {
    const [field, messages] = Object.entries(data)[0] ?? [];
    if (field) {
      const msg = Array.isArray(messages) ? messages[0] : messages;
      return `${field}: ${msg}`;
    }
  }
  return 'Something went wrong. Please try again.';
};

export const authService = {
  login: async (username: string, password: string): Promise<void> => {
    const { data } = await axiosClient.post<{ access: string; refresh: string }>('/auth/login/', {
      username,
      password,
    });
    localStorage.setItem('crm_token', data.access);
    localStorage.setItem('crm_refresh', data.refresh);
  },

  me: async (): Promise<User> => {
    const { data } = await axiosClient.get<User>('/auth/me/');
    return data;
  },

  updateMe: async (payload: Partial<Pick<User, 'first_name' | 'last_name' | 'email'>>): Promise<User> => {
    const { data } = await axiosClient.patch<User>('/auth/me/', payload);
    return data;
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

  updateLead: async (id: number, changes: Partial<CreateLeadDTO>): Promise<Lead> => {
    const { data } = await axiosClient.patch<Lead>(`/leads/${id}/`, changes);
    return data;
  },

  deleteLead: async (id: number): Promise<void> => {
    await axiosClient.delete(`/leads/${id}/`);
  },
};

export default crmService;