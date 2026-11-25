import axiosClient from '../api/axiosClient';
import {
  Activity, CreateLeadDTO, Lead, LeadPage, LeadQuery, Note, NoteKind,
  StatsData, Task, User,
} from '../interfaces';

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

  logout: async (): Promise<void> => {
    const refresh = localStorage.getItem('crm_refresh');
    try {
      if (refresh) await axiosClient.post('/auth/logout/', { refresh });
    } catch {
      // Ignore: the token may already be blacklisted or the server may be down
    } finally {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_refresh');
      localStorage.removeItem('crm_user');
    }
  },

  me: async (): Promise<User> => {
    const { data } = await axiosClient.get<User>('/auth/me/');
    return data;
  },

  updateMe: async (payload: Partial<Pick<User, 'first_name' | 'last_name' | 'email'>>): Promise<User> => {
    const { data } = await axiosClient.patch<User>('/auth/me/', payload);
    return data;
  },

  changePassword: async (payload: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> => {
    await axiosClient.post('/auth/change-password/', payload);
  },
};

export const crmService = {
  getStats: async (): Promise<StatsData> => {
    const { data } = await axiosClient.get<StatsData>('/stats/');
    return data;
  },

  getLeads: async (params: LeadQuery = {}): Promise<LeadPage> => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    const { data } = await axiosClient.get<LeadPage>('/leads/', { params: clean });
    return data;
  },

  getLead: async (id: number): Promise<Lead> => {
    const { data } = await axiosClient.get<Lead>(`/leads/${id}/`);
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

  getActivity: async (limit = 20): Promise<Activity[]> => {
    const { data } = await axiosClient.get<Activity[]>('/activity/', { params: { limit } });
    return data;
  },

  // Notes: the activity log for one lead
  getNotes: async (leadId: number): Promise<Note[]> => {
    const { data } = await axiosClient.get<Note[]>('/notes/', { params: { lead: leadId } });
    return data;
  },

  addNote: async (payload: { lead: number; kind: NoteKind; body: string }): Promise<Note> => {
    const { data } = await axiosClient.post<Note>('/notes/', payload);
    return data;
  },

  deleteNote: async (id: number): Promise<void> => {
    await axiosClient.delete(`/notes/${id}/`);
  },

  // Tasks: follow-ups for one lead
  getTasks: async (leadId: number): Promise<Task[]> => {
    const { data } = await axiosClient.get<Task[]>('/tasks/', { params: { lead: leadId } });
    return data;
  },

  addTask: async (payload: { lead: number; title: string; due_date: string | null }): Promise<Task> => {
    const { data } = await axiosClient.post<Task>('/tasks/', payload);
    return data;
  },

  updateTask: async (id: number, changes: Partial<Pick<Task, 'title' | 'due_date' | 'done'>>): Promise<Task> => {
    const { data } = await axiosClient.patch<Task>(`/tasks/${id}/`, changes);
    return data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await axiosClient.delete(`/tasks/${id}/`);
  },
};

export default crmService;