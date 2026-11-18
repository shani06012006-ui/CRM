import axios from "axios";
import type { ApiResponse, Customer, CustomerInput, User } from "../types";

const API_URL = "http://127.0.0.1:8000/api";

// The shape the Django API returns (snake_case).
interface ApiCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: Customer["status"];
  created_at: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

const http = axios.create({ baseURL: API_URL });

// Attach the JWT to every request automatically.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn Django's error responses into readable messages.
const extractMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Cannot reach the server. Is the Django backend running?";
    const data = error.response.data as Record<string, unknown> | undefined;
    if (typeof data?.detail === "string") return data.detail;
    const first = data ? Object.values(data)[0] : undefined;
    if (Array.isArray(first)) return String(first[0]);
    if (typeof first === "string") return first;
    return "Request failed. Please try again.";
  }
  return "Something went wrong. Please try again.";
};

const call = async <T>(request: Promise<T>): Promise<T> => {
  try {
    return await request;
  } catch (error) {
    throw new Error(extractMessage(error));
  }
};

const toCustomer = (c: ApiCustomer): Customer => ({
  id: c.id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  company: c.company,
  status: c.status,
  createdAt: c.created_at,
});

const saveSession = (username: string, tokens: TokenResponse): User => {
  localStorage.setItem("username", username);
  localStorage.setItem("access", tokens.access);
  localStorage.setItem("refresh", tokens.refresh);
  return { username, token: tokens.access };
};

export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse<User>> => {
    const { data } = await call(http.post<TokenResponse>("/auth/login/", { username, password }));
    return { data: saveSession(username, data), message: "Logged in" };
  },

  register: async (username: string, password: string): Promise<ApiResponse<User>> => {
    const { data } = await call(
      http.post<TokenResponse & { username: string }>("/auth/register/", { username, password })
    );
    return { data: saveSession(data.username, data), message: "Account created" };
  },

  logout: async (): Promise<void> => {
    const refresh = localStorage.getItem("refresh");
    if (refresh) {
      await http.post("/auth/logout/", { refresh }).catch(() => undefined);
    }
    ["username", "access", "refresh"].forEach((key) => localStorage.removeItem(key));
  },
};

export const customerApi = {
  list: async (): Promise<ApiResponse<Customer[]>> => {
    const { data } = await call(http.get<ApiCustomer[]>("/customers/"));
    return { data: data.map(toCustomer), message: "OK" };
  },

  create: async (input: CustomerInput): Promise<ApiResponse<Customer>> => {
    const { data } = await call(http.post<ApiCustomer>("/customers/", input));
    return { data: toCustomer(data), message: "Customer created" };
  },

  update: async (id: number, input: CustomerInput): Promise<ApiResponse<Customer>> => {
    const { data } = await call(http.put<ApiCustomer>(`/customers/${id}/`, input));
    return { data: toCustomer(data), message: "Customer updated" };
  },

  remove: async (id: number): Promise<ApiResponse<number>> => {
    await call(http.delete(`/customers/${id}/`));
    return { data: id, message: "Customer deleted" };
  },
};