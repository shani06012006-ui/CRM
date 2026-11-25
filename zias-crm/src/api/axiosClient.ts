import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('crm_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const clearSession = () => {
  localStorage.removeItem('crm_token');
  localStorage.removeItem('crm_refresh');
  localStorage.removeItem('crm_user');
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const url = original?.url ?? '';

    // Login, refresh, and logout failures go straight to the caller
    const isAuthCall =
      url.includes('/auth/login/') ||
      url.includes('/auth/refresh/') ||
      url.includes('/auth/logout/');

    if (error.response?.status !== 401 || isAuthCall || original._retry) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem('crm_refresh');
    if (!refresh) {
      clearSession();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      original._retry = true;
      const { data } = await axios.post<{ access: string; refresh?: string }>(
        `${API_URL}/auth/refresh/`,
        { refresh }
      );
      localStorage.setItem('crm_token', data.access);
      // With rotation on, the server returns a new refresh token. Save it.
      if (data.refresh) localStorage.setItem('crm_refresh', data.refresh);

      original.headers.Authorization = `Bearer ${data.access}`;
      return axiosClient(original);
    } catch {
      clearSession();
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
);

export default axiosClient;